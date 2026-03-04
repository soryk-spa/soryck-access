/**
 * GET /api/mercadopago/return
 *
 * MercadoPago Checkout Pro return handler for regular (non-seating) ticket purchases.
 *
 * MP sends these query params on return:
 *   external_reference  – our orderId (stored when creating the preference)
 *   payment_id          – MP payment ID (verify this to avoid tampering)
 *   status              – approved | pending | rejected | null
 *   collection_status   – same as status
 *   merchant_order_id   – MP merchant order ID
 *   preference_id       – MP preference ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMPPaymentById } from '@/lib/mercadopago';
import { generateUniqueQRCode } from '@/lib/qr';
import { sendTicketEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { TicketType } from '@prisma/client';

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const orderId = searchParams.get('external_reference');
  const mpPaymentId = searchParams.get('payment_id');
  const status = searchParams.get('status') ?? searchParams.get('collection_status');

  logger.info('[MP Return] Received return', { orderId, mpPaymentId, status });

  // ── User cancelled ─────────────────────────────────────────────────────────
  if (!mpPaymentId || !orderId) {
    logger.warn('[MP Return] Missing payment_id or external_reference – likely cancelled');
    return NextResponse.redirect(`${APP_URL()}/payment/error?reason=transaction-cancelled`);
  }

  try {
    // ── Verify payment with MP API (anti-tampering) ────────────────────────
    const mpPayment = await getMPPaymentById(mpPaymentId);
    const mpStatus = mpPayment.status; // approved | pending | rejected | cancelled

    logger.info('[MP Return] MP payment verified', { mpPaymentId, mpStatus, orderId });

    // ── Find payment record in DB ──────────────────────────────────────────
    const payment = await prisma.payment.findFirst({
      where: { token: orderId }, // We stored orderId as token when creating preference
      include: {
        order: {
          include: {
            event: {
              include: { ticketTypes: true },
            },
            user: true,
          },
        },
      },
    });

    if (!payment) {
      logger.error('[MP Return] Payment record not found', undefined, { orderId });
      return NextResponse.redirect(`${APP_URL()}/payment/error?reason=payment-not-found`);
    }

    const ticketType: TicketType | undefined = payment.order.event.ticketTypes.find(
      (tt) => tt.id === payment.transactionId // We stored ticketTypeId as transactionId
    ) ?? payment.order.event.ticketTypes[0];

    if (!ticketType) {
      logger.error('[MP Return] Ticket type not found', undefined, { orderId });
      return NextResponse.redirect(`${APP_URL()}/payment/error?reason=ticket-type-not-found`);
    }

    // ── Idempotency: already processed ────────────────────────────────────
    if (payment.order.status === 'PAID') {
      logger.info('[MP Return] Order already paid, redirecting to success', { orderId });
      return NextResponse.redirect(`${APP_URL()}/payment/success?orderId=${payment.order.id}`);
    }

    // ── Handle approved payment ────────────────────────────────────────────
    if (mpStatus === 'approved') {
      await processApprovedPayment(payment, mpPaymentId, ticketType);
      return NextResponse.redirect(`${APP_URL()}/payment/success?orderId=${payment.order.id}`);
    }

    // ── Handle pending ────────────────────────────────────────────────────
    if (mpStatus === 'pending' || mpStatus === 'in_process') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PENDING' },
      });
      return NextResponse.redirect(
        `${APP_URL()}/payment/error?orderId=${payment.order.id}&reason=payment-pending`
      );
    }

    // ── Handle rejected / cancelled ───────────────────────────────────────
    await prisma.$transaction([
      prisma.order.update({ where: { id: payment.order.id }, data: { status: 'CANCELLED' } }),
      prisma.payment.update({ where: { id: payment.id }, data: { status: 'REJECTED' } }),
    ]);

    return NextResponse.redirect(
      `${APP_URL()}/payment/error?orderId=${payment.order.id}&reason=transaction-failed`
    );
  } catch (error) {
    logger.error('[MP Return] Unexpected error', error as Error);
    return NextResponse.redirect(`${APP_URL()}/payment/error?reason=confirmation-error`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function processApprovedPayment(
  payment: {
    id: string;
    order: {
      id: string;
      quantity: number;
      discountAmount: number | null;
      orderNumber: string;
      event: { id: string; title: string; location: string; startDate: Date };
      user: { id: string; email: string; firstName: string | null };
    };
  },
  mpPaymentId: string,
  ticketType: TicketType,
) {
  const { order } = payment;

  logger.info('[MP Return] Processing approved payment', { orderId: order.id });

  const timestamp = Date.now();
  const totalTickets = order.quantity * ticketType.ticketsGenerated;

  const ticketsData = Array.from({ length: totalTickets }, (_, i) => ({
    qrCode: generateUniqueQRCode(order.event.id, order.user.id, timestamp, i),
    eventId: order.event.id,
    userId: order.user.id,
    orderId: order.id,
    ticketTypeId: ticketType.id,
  }));

  const [, updatedOrder] = await prisma.$transaction([
    prisma.ticket.createMany({ data: ticketsData }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID', paymentIntentId: mpPaymentId },
      include: { tickets: true },
    }),
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'APPROVED', authorizationCode: mpPaymentId },
    }),
  ]);

  logger.info('[MP Return] Tickets generated', { orderId: order.id, count: totalTickets });

  // Send ticket email
  try {
    if (order.user.firstName) {
      await sendTicketEmail({
        userEmail: order.user.email,
        userName: order.user.firstName,
        eventTitle: order.event.title,
        eventDate: order.event.startDate.toISOString(),
        eventLocation: order.event.location,
        orderNumber: updatedOrder.id,
        tickets: (updatedOrder as typeof updatedOrder & { tickets: { qrCode: string | null }[] }).tickets.map(
          (t) => ({ qrCode: t.qrCode ?? '', qrCodeImage: `data:image/png;base64,${t.qrCode}` })
        ),
      });
    }
  } catch (e) {
    logger.error('[MP Return] Failed to send ticket email', e as Error, { orderId: order.id });
  }
}
