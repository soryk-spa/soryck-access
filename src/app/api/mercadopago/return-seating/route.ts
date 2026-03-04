/**
 * GET /api/mercadopago/return-seating
 *
 * MercadoPago Checkout Pro return handler for seating ticket purchases.
 *
 * The seating metadata is stored in the Payment record:
 *   token           = orderId  (to find the record)
 *   transactionId   = "seating:<sessionId>:<seatId1>,<seatId2>,..."
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMPPaymentById } from '@/lib/mercadopago';
import { SeatReservationManager } from '@/lib/seat-reservation-manager';
import { generateTicketQR } from '@/lib/qr';
import { sendTicketEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const orderId = searchParams.get('external_reference');
  const mpPaymentId = searchParams.get('payment_id');
  const status = searchParams.get('status') ?? searchParams.get('collection_status');

  logger.info('[MP Seating Return] Received return', { orderId, mpPaymentId, status });

  // ── User cancelled ─────────────────────────────────────────────────────────
  if (!mpPaymentId || !orderId) {
    logger.warn('[MP Seating Return] Missing params – likely cancelled');
    return NextResponse.redirect(`${APP_URL()}/payment/error?reason=transaction-cancelled`);
  }

  try {
    // ── Verify with MP API ─────────────────────────────────────────────────
    const mpPayment = await getMPPaymentById(mpPaymentId);
    const mpStatus = mpPayment.status;

    logger.info('[MP Seating Return] MP payment verified', { mpPaymentId, mpStatus, orderId });

    // ── Find payment record ────────────────────────────────────────────────
    const payment = await prisma.payment.findFirst({
      where: { token: orderId },
      include: {
        order: {
          include: { event: true, user: true },
        },
      },
    });

    if (!payment) {
      logger.error('[MP Seating Return] Payment not found', undefined, { orderId });
      return NextResponse.redirect(`${APP_URL()}/payment/error?reason=payment-not-found`);
    }

    // ── Idempotency ────────────────────────────────────────────────────────
    if (payment.order.status === 'PAID') {
      return NextResponse.redirect(`${APP_URL()}/payment/success?orderId=${payment.order.id}`);
    }

    // ── Approved ───────────────────────────────────────────────────────────
    if (mpStatus === 'approved') {
      await processApprovedSeatingPayment(payment, mpPaymentId);
      return NextResponse.redirect(`${APP_URL()}/payment/success?orderId=${payment.order.id}`);
    }

    // ── Pending ────────────────────────────────────────────────────────────
    if (mpStatus === 'pending' || mpStatus === 'in_process') {
      return NextResponse.redirect(
        `${APP_URL()}/payment/error?orderId=${payment.order.id}&reason=payment-pending`
      );
    }

    // ── Rejected / cancelled ───────────────────────────────────────────────
    await handleFailedSeatingPayment(payment);
    return NextResponse.redirect(
      `${APP_URL()}/payment/error?orderId=${payment.order.id}&reason=transaction-failed`
    );
  } catch (error) {
    logger.error('[MP Seating Return] Unexpected error', error as Error);
    return NextResponse.redirect(`${APP_URL()}/payment/error?reason=confirmation-error`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function processApprovedSeatingPayment(
  payment: {
    id: string;
    transactionId: string;
    order: {
      id: string;
      eventId: string;
      userId: string;
      paymentIntentId: string | null;
    };
  },
  mpPaymentId: string,
) {
  const { order } = payment;

  // transactionId stores: "seating:<sessionId>:<seatId1>,<seatId2>,..."
  if (!payment.transactionId.startsWith('seating:')) {
    throw new Error('Invalid seating metadata in transactionId');
  }

  const [, sessionId, seatIdsStr] = payment.transactionId.split(':');
  const seatIds = seatIdsStr.split(',');

  logger.info('[MP Seating Return] Processing approved payment', {
    orderId: order.id,
    sessionId,
    seatCount: seatIds.length,
  });

  // Get seats
  const seats = await prisma.eventSeat.findMany({
    where: { id: { in: seatIds } },
    include: { section: true },
  });

  if (seats.length !== seatIds.length) {
    throw new Error(`Expected ${seatIds.length} seats but found ${seats.length}`);
  }

  await prisma.$transaction([
    // Create tickets
    ...seats.map((seat) =>
      prisma.ticket.create({
        data: {
          id: randomUUID(),
          qrCode: `${order.eventId}-${order.userId}-${seat.id}-${Date.now()}`,
          eventId: order.eventId,
          userId: order.userId,
          orderId: order.id,
          seatId: seat.id,
          status: 'ACTIVE',
        },
      }),
    ),
    // Mark seats as sold
    prisma.eventSeat.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'SOLD' },
    }),
    // Update order
    prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID', paymentIntentId: mpPaymentId },
    }),
    // Update payment
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'APPROVED', authorizationCode: mpPaymentId },
    }),
  ]);

  logger.info('[MP Seating Return] Tickets and seats updated', { orderId: order.id });

  // Release reservation
  await SeatReservationManager.releaseReservation(sessionId);

  // Send email
  try {
    await sendSeatingEmail(order.id);
  } catch (e) {
    logger.error('[MP Seating Return] Failed to send email', e as Error, { orderId: order.id });
  }
}

async function handleFailedSeatingPayment(
  payment: {
    id: string;
    transactionId: string;
    order: { id: string };
  },
) {
  if (payment.transactionId.startsWith('seating:')) {
    const [, sessionId] = payment.transactionId.split(':');
    await SeatReservationManager.releaseReservation(sessionId);
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id: payment.order.id }, data: { status: 'CANCELLED' } }),
    prisma.payment.update({ where: { id: payment.id }, data: { status: 'REJECTED' } }),
  ]);
}

async function sendSeatingEmail(orderId: string) {
  const [event, user, tickets] = await Promise.all([
    prisma.order
      .findUnique({ where: { id: orderId }, include: { event: true } })
      .then((o) => o?.event),
    prisma.order
      .findUnique({ where: { id: orderId }, include: { user: true } })
      .then((o) => o?.user),
    prisma.ticket.findMany({
      where: { orderId },
      include: { seat: { include: { section: true } } },
    }),
  ]);

  if (!event || !user) return;

  const ticketsWithQR = await Promise.all(
    tickets.map(async (ticket) => {
      const qrCodeImage = await generateTicketQR({
        ticketId: ticket.id,
        eventId: event.id,
        userId: user.id,
        eventTitle: event.title,
        attendeeName: user.firstName || user.email.split('@')[0],
        attendeeEmail: user.email,
        eventDate: event.startDate.toISOString(),
        eventLocation: event.location,
        qrCode: ticket.qrCode,
        timestamp: new Date().toISOString(),
      });

      return {
        qrCode: ticket.qrCode ?? '',
        qrCodeImage,
        seatInfo: ticket.seat
          ? {
              sectionName: ticket.seat.section.name,
              row: ticket.seat.row,
              number: ticket.seat.number,
              sectionColor: ticket.seat.section.color,
            }
          : undefined,
      };
    }),
  );

  await sendTicketEmail({
    userEmail: user.email,
    userName: user.firstName || user.email.split('@')[0],
    eventTitle: event.title,
    eventDate: event.startDate.toISOString(),
    eventLocation: event.location,
    orderNumber: orderId,
    tickets: ticketsWithQR,
  });
}
