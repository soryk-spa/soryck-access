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
    // If the mobile app didn't send it, look it up from the saved card
    let paymentMethodId = rawPaymentMethodId;
    if (!paymentMethodId) {
      const resolvedCardId = cardId;
      if (resolvedCardId) {
        try {
          const { listCustomerCards } = await import('@/lib/mercadopago');
          const cards = await listCustomerCards(user.mpCustomerId);
          const cardList = Array.isArray(cards) ? cards : [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const found = cardList.find((c: any) => c.id === resolvedCardId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paymentMethodId = (found as any)?.payment_method?.id ?? undefined;
          logger.info(`[MP payments] Derived paymentMethodId from card ${resolvedCardId}: ${paymentMethodId}`);
        } catch (err) {
          logger.warn('[MP payments] Could not derive paymentMethodId from card', { cardId: resolvedCardId });
        }
      }
      if (!paymentMethodId) {
        return NextResponse.json(
          { error: 'No se pudo determinar el método de pago. Envía paymentMethodId o cardId.' },
          { status: 400 },
        );
      }
    }

    const mpPayment = await createMPPayment({
      amount: finalAmount,
      currency: event.currency,
      cardToken,
      installments,
      paymentMethodId,
      // Only send mpCustomerId when cardId is also present (saved-card flow).
      // Fresh-token payments must NOT include payer.id or MP returns "customer server error".
      mpCustomerId: cardId ? user.mpCustomerId ?? undefined : undefined,
      email: user.email,
      description: event.title,
      externalReference: orderNumber,
    });

    // Guard: MP must return a payment ID
    if (!mpPayment.id) {
      logger.error('[MP payments] MP returned a payment without id', undefined, {
        status: mpPayment.status,
        statusDetail: mpPayment.status_detail,
      });
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      return NextResponse.json(
        { error: 'MercadoPago no retornó un ID de pago válido', statusDetail: mpPayment.status_detail },
        { status: 502 },
      );
    }

    // ── Persist Payment record ────────────────────────────────────────────────

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
