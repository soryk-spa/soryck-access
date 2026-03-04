/**
 * POST /api/mercadopago/payments/create
 *
 * Creates a Mercado Pago card payment for the authenticated user.
 *
 * The mobile app flow:
 *  1. App lists saved cards → GET /api/mercadopago/customers/cards
 *  2. User picks a card and enters CVV
 *  3. App creates a one-time token with MP's mobile SDK:
 *       MP.createCardToken({ cardId, securityCode }) → cardToken
 *  4. App sends this payload to this endpoint:
 *
 * Body (JSON):
 *   {
 *     ticketTypeId:   string
 *     quantity:       number (1-10)
 *     cardToken:      string   ← one-time token from MP SDK
 *     paymentMethodId: string  ← e.g. "visa", "master" (returned with card list)
 *     installments:   number   (default 1)
 *     promoCode?:     string
 *   }
 *
 * Response (success):
 *   { success: true, orderId, mpPaymentId, status, ticketsGenerated }
 *
 * Response (pending – rare for cards):
 *   { success: false, pending: true, orderId, mpPaymentId, status, statusDetail }
 *
 * Response (failed):
 *   { error: string, mpPaymentId?, status?, statusDetail? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createMPPayment } from '@/lib/mercadopago';
import { generateUniqueQRCode } from '@/lib/qr';
import {
  calculatePriceBreakdown,
  calculatePriceBreakdownWithDiscount,
} from '@/lib/commission';
import { DiscountCodeService } from '@/lib/discount-codes';
import { sendTicketEmail } from '@/lib/email';
import { RateLimitPresets } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { Order, Event, User, TicketType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

const bodySchema = z.object({
  ticketTypeId: z.string().min(1, 'Se requiere el tipo de ticket'),
  quantity: z
    .number()
    .min(1, 'La cantidad debe ser al menos 1')
    .max(10, 'No puedes comprar más de 10 tickets a la vez'),
  cardToken: z.string().min(1, 'Se requiere el token de tarjeta'),
  // cardId is the saved MP card ID – used to look up paymentMethodId if not provided
  cardId: z.string().optional(),
  // paymentMethodId is optional: if omitted we derive it from the saved card
  paymentMethodId: z.string().optional(),
  installments: z.number().min(1).max(12).default(1),
  promoCode: z.string().optional(),
});

// ── Helper: generate order number ─────────────────────────────────────────────

function generateOrderNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const rnd = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `MP${yy}${mm}${dd}${hh}${min}${ss}${rnd}`.substring(0, 26);
}

// ── Helper: create tickets after successful payment ───────────────────────────

async function generateTickets(
  order: Order,
  event: Event,
  user: User,
  ticketType: TicketType,
) {
  const timestamp = Date.now();
  const totalTickets = order.quantity * ticketType.ticketsGenerated;
  const ticketsData = Array.from({ length: totalTickets }, (_, i) => ({
    qrCode: generateUniqueQRCode(event.id, user.id, timestamp, i),
    eventId: event.id,
    userId: user.id,
    orderId: order.id,
    ticketTypeId: ticketType.id,
  }));

  const [, updatedOrder] = await prisma.$transaction([
    prisma.ticket.createMany({ data: ticketsData }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' },
      include: { tickets: true },
    }),
  ]);

  // Fire-and-forget email
  sendTicketEmail({
    userEmail: user.email,
    userName: user.firstName ?? user.email.split('@')[0],
    eventTitle: event.title,
    eventDate: event.startDate.toISOString(),
    eventLocation: event.location,
    orderNumber: updatedOrder.id,
    tickets: updatedOrder.tickets.map((t) => ({
      qrCode: t.qrCode!,
      qrCodeImage: `data:image/png;base64,${t.qrCode}`,
    })),
  }).catch((err) =>
    logger.error('[MP payments] Error sending ticket email', err instanceof Error ? err : undefined),
  );

  return { updatedOrder, totalTickets };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Captured outside try so the catch block can reference it for cleanup
  let currentUserId: string | undefined;

  try {
    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      'unknown';
    const rateCheck = await RateLimitPresets.payment.isAllowed(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes de pago. Intenta en un momento.' },
        { status: 429 },
      );
    }

    const user = await requireAuth();
    currentUserId = user.id;
    const body = await request.json();
    const validation = bodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 },
      );
    }

    const { ticketTypeId, quantity, cardToken, cardId, paymentMethodId: rawPaymentMethodId, installments, promoCode } =
      validation.data;

    // ── Validate ticket type & capacity ───────────────────────────────────────

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: true },
    });

    if (!ticketType || !ticketType.event.isPublished) {
      return NextResponse.json(
        { error: 'Tipo de entrada no encontrado o el evento no está publicado' },
        { status: 404 },
      );
    }

    const event = ticketType.event;

    const soldCount = await prisma.ticket.count({ where: { ticketTypeId } });
    const capacityInTickets = ticketType.capacity * ticketType.ticketsGenerated;
    const available = capacityInTickets - soldCount;

    if (quantity * ticketType.ticketsGenerated > available) {
      return NextResponse.json(
        {
          error: `No hay suficientes tickets disponibles. Solo quedan ${Math.floor(
            available / ticketType.ticketsGenerated,
          )}.`,
        },
        { status: 400 },
      );
    }

    // ── Price calculation ─────────────────────────────────────────────────────

    const baseTotal = ticketType.price * quantity;
    let priceBreakdown;
    let discountValidation = null;

    if (promoCode?.trim()) {
      discountValidation = await DiscountCodeService.validateDiscountCode(
        promoCode.trim(),
        user.id,
        ticketTypeId,
        quantity,
      );

      if (!discountValidation.isValid) {
        return NextResponse.json(
          { error: discountValidation.error },
          { status: 400 },
        );
      }

      priceBreakdown = calculatePriceBreakdownWithDiscount(
        baseTotal,
        discountValidation.discountAmount ?? 0,
        event.currency,
      );
      priceBreakdown.promoCode = discountValidation.code;
    } else {
      priceBreakdown = calculatePriceBreakdown(baseTotal, event.currency);
      priceBreakdown.originalAmount = baseTotal;
      priceBreakdown.discountAmount = 0;
    }

    const finalAmount = priceBreakdown.totalPrice;

    // ── Create Order in DB ────────────────────────────────────────────────────

    const orderNumber = generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: finalAmount,
        baseAmount: priceBreakdown.basePrice,
        commissionAmount: priceBreakdown.commission,
        originalAmount: priceBreakdown.originalAmount,
        discountAmount: priceBreakdown.discountAmount,
        currency: event.currency,
        quantity,
        status: 'PENDING',
        userId: user.id,
        eventId: event.id,
      },
    });

    // ── Handle free tickets (100% discount) ──────────────────────────────────

    if (finalAmount === 0) {
      if (discountValidation?.isValid) {
        await DiscountCodeService.applyCodeUsage(
          discountValidation,
          user.id,
          order.id,
          priceBreakdown.originalAmount ?? 0,
          0,
        );
      }
      const { totalTickets } = await generateTickets(order, event, user, ticketType);
      return NextResponse.json({
        success: true,
        orderId: order.id,
        isFree: true,
        ticketsGenerated: totalTickets,
      });
    }

    // ── Create MP payment ─────────────────────────────────────────────────────

    if (!user.mpCustomerId) {
      return NextResponse.json(
        {
          error:
            'No tienes un perfil de pagos configurado. Guarda una tarjeta primero.',
        },
        { status: 400 },
      );
    }

    // ── Resolve paymentMethodId ────────────────────────────────────────────────
    // When cardId is present we look up the method from MP to correct debit cards:
    // the mobile app sends "visa"/"master" but debit cards need "debvisa"/"debmaster".
    let paymentMethodId = rawPaymentMethodId;
    if (cardId) {
      try {
        const { listCustomerCards } = await import('@/lib/mercadopago');
        const cards = await listCustomerCards(user.mpCustomerId!);
        const cardList = Array.isArray(cards) ? cards : [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = cardList.find((c: any) => c.id === cardId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const derivedMethod = (found as any)?.payment_method?.id as string | undefined;
        if (derivedMethod) {
          if (derivedMethod !== paymentMethodId) {
            logger.info(`[MP payments] Corrected paymentMethodId: app sent "${paymentMethodId}" → using "${derivedMethod}" from card ${cardId}`);
          }
          paymentMethodId = derivedMethod;
        } else {
          logger.warn(`[MP payments] Could not derive paymentMethodId from card ${cardId}, keeping app value: ${paymentMethodId}`);
        }
      } catch {
        // Non-fatal: use whatever the app sent
        logger.warn(`[MP payments] listCustomerCards failed for card ${cardId}, keeping app paymentMethodId: ${paymentMethodId}`);
      }
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'No se pudo determinar el método de pago. Envía paymentMethodId o cardId.' },
        { status: 400 },
      );
    }

    const mpPayment = await createMPPayment({
      amount: finalAmount,
      currency: event.currency,
      cardToken,
      installments,
      paymentMethodId,
      // Send mpCustomerId when cardId is present — MP requires payer.id to validate
      // tokens created from saved cards (card_id). Without it MP returns 2002.
      mpCustomerId: cardId ? (user.mpCustomerId ?? undefined) : undefined,
      email: user.email,
      description: event.title,
      externalReference: orderNumber,
    });

    // Log full MP response always (visible in Vercel Runtime Logs)
    console.log('[MP payments] Raw createMPPayment response:', JSON.stringify({
      id: mpPayment.id,
      status: mpPayment.status,
      status_detail: mpPayment.status_detail,
      payment_method_id: (mpPayment as unknown as Record<string, unknown>).payment_method_id,
      keys: Object.keys(mpPayment as unknown as object),
    }));

    // Guard: MP must return a payment ID
    if (!mpPayment.id) {
      const fullResponse = JSON.stringify(mpPayment);
      console.error('[MP payments] MP returned payment without id:', fullResponse);
      logger.error(`[MP payments] MP returned payment without id. paymentMethodId=${paymentMethodId} full=${fullResponse}`);
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      return NextResponse.json(
        {
          error: 'MercadoPago no retornó un ID de pago válido',
          status: mpPayment.status,
          statusDetail: mpPayment.status_detail,
          // Include full response for debugging from mobile logs
          debug: fullResponse,
        },
        { status: 502 },
      );
    }

    // ── Persist Payment record ────────────────────────────────────────────────

    try {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          transactionId: String(mpPayment.id),
          amount: finalAmount,
          currency: event.currency,
          status: mpPayment.status ?? 'PENDING',
          paymentMethod: paymentMethodId,
          authorizationCode: mpPayment.authorization_code ?? null,
          paymentGateway: 'MERCADOPAGO',
          transactionDate: mpPayment.date_approved
            ? new Date(mpPayment.date_approved)
            : null,
        },
      });
    } catch (dbErr) {
      // Most likely: unique constraint on transactionId (duplicate payment) or orderId (order already paid)
      const dbMsg = dbErr instanceof Error ? dbErr.message : JSON.stringify(dbErr);
      console.error('[MP payments] prisma.payment.create failed:', dbMsg, { mpPaymentId: mpPayment.id, orderId: order.id });
      logger.error(`[MP payments] DB error persisting payment for order ${order.id}: ${dbMsg}`);
      // The MP payment already went through — return success info so the app can proceed
      // but flag that DB persistence failed so we can investigate
      return NextResponse.json(
        {
          success: mpPayment.status === 'approved',
          warning: 'El pago fue procesado pero hubo un error al registrarlo. Contacta a soporte con tu número de orden.',
          orderId: order.id,
          mpPaymentId: mpPayment.id,
          status: mpPayment.status,
          statusDetail: mpPayment.status_detail,
        },
        { status: 207 },
      );
    }

    // ── Handle payment status ─────────────────────────────────────────────────

    if (mpPayment.status === 'approved') {
      // Apply promo code usage
      if (discountValidation?.isValid) {
        await DiscountCodeService.applyCodeUsage(
          discountValidation,
          user.id,
          order.id,
          priceBreakdown.originalAmount ?? 0,
          finalAmount,
        );
      }

      const { totalTickets } = await generateTickets(order, event, user, ticketType);

      return NextResponse.json({
        success: true,
        orderId: order.id,
        mpPaymentId: mpPayment.id,
        status: mpPayment.status,
        statusDetail: mpPayment.status_detail,
        ticketsGenerated: totalTickets,
      });
    }

    if (mpPayment.status === 'in_process' || mpPayment.status === 'pending') {
      // Webhook will confirm later
      return NextResponse.json(
        {
          success: false,
          pending: true,
          orderId: order.id,
          mpPaymentId: mpPayment.id,
          status: mpPayment.status,
          statusDetail: mpPayment.status_detail,
          message: 'El pago está siendo procesado. Recibirás una notificación cuando sea confirmado.',
        },
        { status: 202 },
      );
    }

    // Payment was rejected
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json(
      {
        error: 'El pago fue rechazado',
        mpPaymentId: mpPayment.id,
        status: mpPayment.status,
        statusDetail: mpPayment.status_detail,
      },
      { status: 402 },
    );
  } catch (error) {
    // Auth errors thrown by requireAuth() → 401 (not 500)
    if (
      error instanceof Error &&
      (error.message.includes('no autenticado') ||
        error.message.includes('Acceso denegado') ||
        error.message.includes('not authenticated') ||
        error.message.includes('Unauthorized'))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // ── MercadoPago SDK error handling ───────────────────────────────────────
    // The MP SDK v3 throws plain objects (not Error instances) with formats:
    //   { status: 4xx, message: "...", cause: [{ code, description }] }  ← cause array (may be empty)
    //   { status: 4xx, message: "..." }                                  ← no cause
    //   { cause: [{ code, description }] }                               ← older SDK v2
    const errObj = error as Record<string, unknown>;
    const mpCause = errObj?.cause;
    const causeArray = Array.isArray(mpCause) ? mpCause : mpCause ? [mpCause] : [];

    if (causeArray.length > 0) {
      const mpError = causeArray[0] as { code?: string | number; description?: string };
      logger.error('[MP payments] MercadoPago API error (cause)', undefined, {
        code: mpError.code,
        description: mpError.description,
      });

      // code 2002 = customer not found in MP (stale mpCustomerId in DB).
      // Clear it so the next request creates a fresh MP customer automatically.
      if (mpError.code === 2002 || mpError.code === '2002') {
        if (currentUserId) {
          try {
            await prisma.user.update({
              where: { id: currentUserId },
              data: { mpCustomerId: null },
            });
            logger.warn(`[MP payments] Cleared stale mpCustomerId for user ${currentUserId}`);
          } catch {
            logger.warn(`[MP payments] Could not clear mpCustomerId for user ${currentUserId}`);
          }
        }
        return NextResponse.json(
          {
            error: 'Perfil de pagos no encontrado. Intenta nuevamente para auto-corregirlo.',
            code: 2002,
            retryable: true,
          },
          { status: 422 },
        );
      }

      return NextResponse.json(
        {
          error: 'Error de MercadoPago',
          code: mpError.code,
          details: mpError.description ?? 'Error al procesar el pago con MercadoPago',
        },
        { status: 422 },
      );
    }

    // MP SDK plain object with status + message but empty/no cause
    const mpStatus = typeof errObj?.status === 'number' ? errObj.status : null;
    const mpMessage = typeof errObj?.message === 'string' ? errObj.message : null;
    if (!(error instanceof Error) && (mpStatus || mpMessage)) {
      const logPayload = JSON.stringify(error);
      logger.error('[MP payments] MercadoPago plain object error', undefined, { raw: logPayload });
      console.error('[POST /api/mercadopago/payments/create] MP plain error:', logPayload);

      // "customer server error" (MP 500) = broken/stale MP customer.
      // Clear mpCustomerId so the next card-add creates a fresh one.
      const isCustomerError =
        mpStatus === 500 &&
        typeof mpMessage === 'string' &&
        mpMessage.toLowerCase().includes('customer');
      if (isCustomerError && currentUserId) {
        try {
          await prisma.user.update({ where: { id: currentUserId }, data: { mpCustomerId: null } });
          logger.warn(`[MP payments] Cleared mpCustomerId after customer server error for user ${currentUserId}`);
        } catch {
          logger.warn(`[MP payments] Could not clear mpCustomerId for user ${currentUserId}`);
        }
        return NextResponse.json(
          {
            error: 'Perfil de pagos inválido. Elimina tus tarjetas guardadas y agrégalas de nuevo.',
            code: 'customer_server_error',
            retryable: false,
          },
          { status: 422 },
        );
      }

      return NextResponse.json(
        {
          error: 'Error de MercadoPago',
          code: mpStatus,
          details: mpMessage ?? logPayload,
        },
        { status: mpStatus && mpStatus >= 400 && mpStatus < 500 ? 422 : 502 },
      );
    }

    // Log full error for debugging — console.error always appears in Vercel Runtime Logs
    const errorStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
    console.error('[POST /api/mercadopago/payments/create] UNHANDLED ERROR:', {
      name: error instanceof Error ? error.name : 'unknown',
      message: error instanceof Error ? error.message : errorStr,
      stack: error instanceof Error ? error.stack?.slice(0, 800) : undefined,
      raw: errorStr,
    });
    logger.error('[POST /api/mercadopago/payments/create]', error instanceof Error ? error : undefined, {
      errorRaw: errorStr,
    });
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : errorStr,
      },
      { status: 500 },
    );
  }
}
