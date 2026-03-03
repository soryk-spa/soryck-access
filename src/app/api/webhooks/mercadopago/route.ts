/**
 * POST /api/webhooks/mercadopago
 *
 * Receives payment notifications from Mercado Pago (IPN / Webhooks).
 *
 * MP calls this URL when the status of a payment changes.
 * Typical body: { action: "payment.updated", data: { id: "1234567890" } }
 *
 * Security: MP sends an x-signature header that we verify with HMAC-SHA256
 * using MP_WEBHOOK_SECRET.
 *
 * This handler:
 *  1. Verifies the signature
 *  2. Fetches the full payment from MP API
 *  3. Finds the matching Order by externalReference (= our orderNumber)
 *  4. If approved → generates tickets + updates DB + sends email
 *  5. If failed/cancelled → marks order as CANCELLED
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMPWebhookSignature, getMPPaymentById } from '@/lib/mercadopago';
import { generateUniqueQRCode } from '@/lib/qr';
import { sendTicketEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const requestId = `mp-wh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  console.log(`[webhook:${requestId}] Mercado Pago webhook received`);

  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody) as {
      action?: string;
      type?: string;
      data?: { id?: string | number };
    };

    console.log(`[webhook:${requestId}] action=${body.action ?? body.type} dataId=${body.data?.id}`);

    // ── Signature verification ──────────────────────────────────────────────

    const xSignature = request.headers.get('x-signature') ?? '';
    const xRequestId = request.headers.get('x-request-id') ?? '';
    const dataId = String(body.data?.id ?? '');

    if (xSignature) {
      const isValid = verifyMPWebhookSignature(xSignature, xRequestId, dataId);
      if (!isValid) {
        console.error(`[webhook:${requestId}] Invalid signature`);
        return new NextResponse('Invalid signature', { status: 401 });
      }
    }

    // ── Only handle payment events ──────────────────────────────────────────

    const action = body.action ?? body.type ?? '';
    if (!action.startsWith('payment')) {
      console.log(`[webhook:${requestId}] Ignored action: ${action}`);
      return NextResponse.json({ received: true });
    }

    const mpPaymentId = body.data?.id;
    if (!mpPaymentId) {
      console.warn(`[webhook:${requestId}] Missing data.id`);
      return NextResponse.json({ received: true });
    }

    // ── Fetch payment details from MP ───────────────────────────────────────

    const mpPayment = await getMPPaymentById(mpPaymentId);
    console.log(
      `[webhook:${requestId}] MP payment id=${mpPayment.id} status=${mpPayment.status} ` +
        `ref=${mpPayment.external_reference}`,
    );

    // ── Find our Order by externalReference (= orderNumber) ────────────────

    const orderNumber = mpPayment.external_reference;
    if (!orderNumber) {
      console.warn(`[webhook:${requestId}] No external_reference on payment ${mpPayment.id}`);
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: true,
        event: true,
        tickets: true,
        payment: true,
      },
    });

    if (!order) {
      console.error(`[webhook:${requestId}] Order not found for ref=${orderNumber}`);
      return NextResponse.json({ received: true });
    }

    // Idempotency: skip if already processed
    if (order.status === 'PAID') {
      console.log(`[webhook:${requestId}] Order ${orderNumber} already PAID – skipping`);
      return NextResponse.json({ received: true });
    }

    // ── Update Payment record ───────────────────────────────────────────────

    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        transactionId: String(mpPayment.id),
        amount: order.totalAmount,
        currency: order.currency,
        status: mpPayment.status ?? 'PENDING',
        paymentMethod: String(mpPayment.payment_method_id ?? ''),
        authorizationCode: mpPayment.authorization_code ?? null,
        paymentGateway: 'MERCADOPAGO',
        transactionDate: mpPayment.date_approved
          ? new Date(mpPayment.date_approved)
          : null,
      },
      update: {
        status: mpPayment.status ?? 'PENDING',
        authorizationCode: mpPayment.authorization_code ?? null,
        transactionDate: mpPayment.date_approved
          ? new Date(mpPayment.date_approved)
          : null,
      },
    });

    // ── Handle approved payments ────────────────────────────────────────────

    if (mpPayment.status === 'approved') {
      console.log(`[webhook:${requestId}] Payment approved – generating tickets`);

      // Get the ticket type from the order's event
      const ticketType = await prisma.ticketType.findFirst({
        where: { eventId: order.eventId },
        orderBy: { createdAt: 'asc' },
      });

      if (!ticketType) {
        console.error(
          `[webhook:${requestId}] No ticket type found for event ${order.eventId}`,
        );
        return NextResponse.json({ received: true }, { status: 500 });
      }

      const timestamp = Date.now();
      const totalTickets = order.quantity * ticketType.ticketsGenerated;
      const ticketsData = Array.from({ length: totalTickets }, (_, i) => ({
        qrCode: generateUniqueQRCode(order.eventId, order.userId, timestamp, i),
        eventId: order.eventId,
        userId: order.userId,
        orderId: order.id,
        ticketTypeId: ticketType.id,
      }));

      const [, updatedOrder] = await prisma.$transaction([
        prisma.ticket.createMany({ data: ticketsData }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paymentIntentId: String(mpPayment.id),
          },
          include: { tickets: true },
        }),
      ]);

      console.log(
        `[webhook:${requestId}] ${totalTickets} tickets generated for order ${orderNumber}`,
      );

      // Send ticket email
      await sendTicketEmail({
        userEmail: order.user.email,
        userName: order.user.firstName ?? order.user.email.split('@')[0],
        eventTitle: order.event.title,
        eventDate: order.event.startDate.toISOString(),
        eventLocation: order.event.location,
        orderNumber: updatedOrder.id,
        tickets: updatedOrder.tickets.map((t) => ({
          qrCode: t.qrCode!,
          qrCodeImage: `data:image/png;base64,${t.qrCode}`,
        })),
      }).catch((err) =>
        console.error(`[webhook:${requestId}] Email error:`, err),
      );
    }

    // ── Handle rejected / cancelled payments ───────────────────────────────

    if (
      mpPayment.status === 'rejected' ||
      mpPayment.status === 'cancelled'
    ) {
      console.log(
        `[webhook:${requestId}] Payment ${mpPayment.status} – cancelling order ${orderNumber}`,
      );
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[webhook:${requestId}] Unhandled error:`, error);
    // Always return 200 to MP so it doesn't retry indefinitely
    return NextResponse.json({ received: true, error: true });
  }
}
