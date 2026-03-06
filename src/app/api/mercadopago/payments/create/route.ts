/**
 * POST /api/mercadopago/payments/create
 *
 * Creates a MercadoPago card payment for the authenticated user.
 *
 * Mobile app flow:
 *  1. App lists saved cards → GET /api/mercadopago/customers/cards
 *  2. User picks card + enters CVV
 *  3. App creates one-time token: MP.createCardToken({ cardId, securityCode }) → cardToken
 *  4. POST here with: ticketTypeId, quantity, cardToken, paymentMethodId, cardId, installments
 *
 * NOTE: payer.id is intentionally not sent to MP — it causes "customer server error" with TEST tokens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createMPPayment, listCustomerCards, extractMPError } from '@/lib/mercadopago';
import { generateUniqueQRCode } from '@/lib/qr';
import { calculatePriceBreakdown, calculatePriceBreakdownWithDiscount } from '@/lib/commission';
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
  ticketTypeId: z.string().min(1),
  quantity: z.number().min(1).max(10),
  cardToken: z.string().min(1),
  cardId: z.string().optional(),          // Saved card ID — used to derive paymentMethodId
  paymentMethodId: z.string().optional(), // e.g. "visa", "master" — required if no cardId
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

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let currentUserId: string | undefined;

  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const rateCheck = await RateLimitPresets.payment.isAllowed(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes de pago. Intenta en un momento.' }, { status: 429 });
    }

    const user = await requireAuth();
    currentUserId = user.id;

    const validation = bodySchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: validation.error.issues }, { status: 400 });
    }

    const { ticketTypeId, quantity, cardToken, cardId, paymentMethodId: rawPaymentMethodId, installments, promoCode } =
      validation.data;

    // ── Validate ticket type & capacity ───────────────────────────────────────

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: true },
    });

    if (!ticketType || !ticketType.event.isPublished) {
      return NextResponse.json({ error: 'Tipo de entrada no encontrado o el evento no está publicado' }, { status: 404 });
    }

    const event = ticketType.event;
    const soldCount = await prisma.ticket.count({ where: { ticketTypeId } });
    const available = ticketType.capacity * ticketType.ticketsGenerated - soldCount;

    if (quantity * ticketType.ticketsGenerated > available) {
      return NextResponse.json(
        { error: `Solo quedan ${Math.floor(available / ticketType.ticketsGenerated)} entradas disponibles.` },
        { status: 400 },
      );
    }

    // ── Price calculation ─────────────────────────────────────────────────────

    const baseTotal = ticketType.price * quantity;
    let priceBreakdown;
    let discountValidation = null;

    if (promoCode?.trim()) {
      discountValidation = await DiscountCodeService.validateDiscountCode(promoCode.trim(), user.id, ticketTypeId, quantity);
      if (!discountValidation.isValid) {
        return NextResponse.json({ error: discountValidation.error }, { status: 400 });
      }
      priceBreakdown = calculatePriceBreakdownWithDiscount(baseTotal, discountValidation.discountAmount ?? 0, event.currency);
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

    // ── Free ticket (100% discount) ───────────────────────────────────────────

    if (finalAmount === 0) {
      if (discountValidation?.isValid) {
        await DiscountCodeService.applyCodeUsage(discountValidation, user.id, order.id, priceBreakdown.originalAmount ?? 0, 0);
      }
      const { totalTickets } = await generateTickets(order, event, user, ticketType);
      return NextResponse.json({ success: true, orderId: order.id, isFree: true, ticketsGenerated: totalTickets });
    }

    // ── Resolve paymentMethodId ───────────────────────────────────────────────
    // Debit cards need "debvisa"/"debmaster" but the app may send "visa"/"master".
    // Look up the correct value from the saved card via MP.

    let paymentMethodId = rawPaymentMethodId;
    if (cardId && user.mpCustomerId) {
      try {
        const cards = await listCustomerCards(user.mpCustomerId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = (Array.isArray(cards) ? cards : []).find((c: any) => c.id === cardId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const derived = (found as any)?.payment_method?.id as string | undefined;
        if (derived) {
          if (derived !== paymentMethodId) {
            logger.info(`[MP payments] paymentMethodId corrected: "${paymentMethodId}" → "${derived}"`);
          }
          paymentMethodId = derived;
        }
      } catch {
        // Non-fatal — fall back to app-provided value
        logger.warn(`[MP payments] listCustomerCards failed for ${cardId}, using app paymentMethodId: ${paymentMethodId}`);
      }
    }

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'No se pudo determinar el método de pago.' }, { status: 400 });
    }

    // ── Call MercadoPago ──────────────────────────────────────────────────────

    const mpPayment = await createMPPayment({
      amount: finalAmount,
      cardToken,
      installments,
      paymentMethodId,
      email: user.email,
      description: event.title,
      externalReference: orderNumber,
      mpCustomerId: user.mpCustomerId ?? undefined,
    });

    // Always log MP response for debugging in Vercel Runtime Logs
    console.log('[MP payments] response:', JSON.stringify({
      id: mpPayment.id,
      status: mpPayment.status,
      status_detail: mpPayment.status_detail,
    }));

    if (!mpPayment.id) {
      logger.error(`[MP payments] No payment id returned. status=${mpPayment.status} detail=${mpPayment.status_detail}`);
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      return NextResponse.json(
        { error: 'MercadoPago no retornó un ID de pago válido', debug: JSON.stringify(mpPayment) },
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
          transactionDate: mpPayment.date_approved ? new Date(mpPayment.date_approved) : null,
        },
      });
    } catch (dbErr) {
      // MP payment succeeded but DB write failed — return 207 so app can proceed
      const dbMsg = dbErr instanceof Error ? dbErr.message : JSON.stringify(dbErr);
      logger.error(`[MP payments] DB write failed for order ${order.id}: ${dbMsg}`);
      return NextResponse.json(
        {
          success: mpPayment.status === 'approved',
          warning: 'El pago fue procesado pero hubo un error al registrarlo. Contacta soporte.',
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
      if (discountValidation?.isValid) {
        await DiscountCodeService.applyCodeUsage(discountValidation, user.id, order.id, priceBreakdown.originalAmount ?? 0, finalAmount);
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
      return NextResponse.json(
        {
          success: false,
          pending: true,
          orderId: order.id,
          mpPaymentId: mpPayment.id,
          status: mpPayment.status,
          statusDetail: mpPayment.status_detail,
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
        },
        { status: 202 },
      );
    }

    // Rejected
    await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
    return NextResponse.json(
      { error: 'El pago fue rechazado', mpPaymentId: mpPayment.id, status: mpPayment.status, statusDetail: mpPayment.status_detail },
      { status: 402 },
    );

  } catch (error) {
    // ── Auth errors ───────────────────────────────────────────────────────────

    if (error instanceof Error && (
      error.message.includes('no autenticado') ||
      error.message.includes('Acceso denegado') ||
      error.message.includes('not authenticated') ||
      error.message.includes('Unauthorized')
    )) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // ── MercadoPago errors ────────────────────────────────────────────────────
    // MP SDK v3 throws plain objects — use extractMPError to parse them.

    const { status: mpStatus, message: mpMessage, causeCode, causeDescription } = extractMPError(error);
    const isMP = !(error instanceof Error) && (mpStatus !== null || mpMessage !== null || causeCode !== null);

    if (isMP) {
      const raw = JSON.stringify(error);
      console.error('[POST /api/mercadopago/payments/create] MP error:', raw);
      logger.error('[MP payments] MP error', undefined, { raw, causeCode, causeDescription, mpStatus, mpMessage });

      // code 2002 = "Customer not found" — card tokens generated from saved cards (cardId)
      // are internally linked to the MP customer. If that customer is stale/expired in MP,
      // the payment fails even without payer.id. The only recovery is to clear the
      // customer so the user re-adds their card fresh.
      if ((causeCode === 2002 || causeCode === '2002') && currentUserId) {
        try {
          await prisma.user.update({ where: { id: currentUserId }, data: { mpCustomerId: null } });
          logger.warn(`[MP payments] Cleared stale mpCustomerId for user ${currentUserId} after 2002`);
        } catch { /* best effort */ }
        return NextResponse.json(
          { error: 'Tu perfil de pago ha vencido. Por favor elimina tu tarjeta guardada y agrégala de nuevo.', code: 2002 },
          { status: 422 },
        );
      }

      return NextResponse.json(
        {
          error: causeDescription ?? mpMessage ?? 'Error de MercadoPago',
          code: causeCode ?? mpStatus,
        },
        { status: (mpStatus && mpStatus >= 400 && mpStatus < 500) ? 422 : 502 },
      );
    }

    // ── Unexpected error ──────────────────────────────────────────────────────

    const raw = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('[POST /api/mercadopago/payments/create] Unexpected error:', raw);
    logger.error('[POST /api/mercadopago/payments/create]', error instanceof Error ? error : undefined, { raw });
    return NextResponse.json({ error: 'Error interno del servidor', details: raw }, { status: 500 });
  }
}
