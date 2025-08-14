import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { webpayPlus } from "@/lib/transbank";
import { generateUniqueQRCode } from "@/lib/qr";
import { calculatePriceBreakdown } from "@/lib/commission";
import { sendTicketEmail } from '@/lib/email';
import { z } from "zod";
import { Order, Event, User, TicketType } from "@prisma/client";

const createPaymentSchema = z.object({
  ticketTypeId: z.string().min(1, "Se requiere el tipo de ticket"),
  quantity: z.number().min(1, "La cantidad debe ser al menos 1").max(10, "No puedes comprar más de 10 tickets a la vez."),
});

function generateShortBuyOrder(prefix: string = "SP"): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0").slice(0, 2);
  const random = Math.random().toString(36).substr(2, 2).toUpperCase();
  const buyOrder = `${prefix}${year}${month}${day}${hour}${minute}${second}${ms}${random}`;
  return buyOrder.substring(0, 26);
}

function generateShortSessionId(prefix: string = "sess"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  const sessionId = `${prefix}-${timestamp}-${random}`;
  return sessionId.substring(0, 61);
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO DE CREACIÓN DE PAGO POR TIPO DE TICKET ===");

    const user = await requireAuth();
    const body = await request.json();
    const validation = createPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { ticketTypeId, quantity } = validation.data;

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: true
      },
    });

    if (!ticketType || !ticketType.event.isPublished) {
      return NextResponse.json(
        { error: "Tipo de entrada no encontrado o el evento no está publicado" },
        { status: 404 }
      );
    }

    const event = ticketType.event;

    const ticketsSoldForType = await prisma.ticket.count({
      where: { ticketTypeId: ticketTypeId },
    });

    const ticketsGeneratedPerPurchase = ticketType.ticketsGenerated;
    const capacityInTickets = ticketType.capacity * ticketsGeneratedPerPurchase;
    const availableTickets = capacityInTickets - ticketsSoldForType;

    if ((quantity * ticketsGeneratedPerPurchase) > availableTickets) {
      return NextResponse.json(
        { error: `No hay suficientes tickets disponibles. Solo quedan ${Math.floor(availableTickets / ticketsGeneratedPerPurchase)}.` },
        { status: 400 }
      );
    }

    const basePrice = ticketType.price;
    const baseTotalAmount = basePrice * quantity;
    const priceBreakdown = calculatePriceBreakdown(baseTotalAmount, event.currency);
    const finalTotalAmount = priceBreakdown.totalPrice;

    const orderNumber = generateShortBuyOrder("SP");
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: finalTotalAmount,
        baseAmount: baseTotalAmount,
        commissionAmount: priceBreakdown.commission,
        currency: event.currency,
        quantity,
        status: "PENDING",
        userId: user.id,
        eventId: event.id,
      },
    });

    console.log("Orden creada:", { orderId: order.id, total: finalTotalAmount });

    const isFree = ticketType.price === 0;
    if (isFree) {
      console.log("Entrada gratuita, procesando directamente...");
      return await handleAndGenerateTickets(order, event, user, ticketType);
    }

    const sessionId = generateShortSessionId("sess");
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/transbank/return`;

    const transbankResponse = await webpayPlus.create(
      order.orderNumber,
      sessionId,
      finalTotalAmount,
      returnUrl
    );

    await prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId: sessionId,
        token: transbankResponse.token,
        amount: finalTotalAmount,
        currency: event.currency,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl: transbankResponse.url,
      token: transbankResponse.token,
    });

  } catch (error) {
    console.error("=== ERROR GENERAL EN CREACIÓN DE PAGO ===", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

async function handleAndGenerateTickets(order: Order, event: Event, user: User, ticketType: TicketType) {
  console.log(`Generando tickets para la orden ${order.orderNumber}`);

  const timestamp = Date.now();
  const ticketsData = [];
  
  const totalTicketsToGenerate = order.quantity * ticketType.ticketsGenerated;

  for (let i = 0; i < totalTicketsToGenerate; i++) {
    const qrCode = generateUniqueQRCode(event.id, user.id, timestamp, i);
    ticketsData.push({
      qrCode,
      eventId: event.id,
      userId: user.id,
      orderId: order.id,
      ticketTypeId: ticketType.id,
    });
  }

  const transactionResult = await prisma.$transaction([
    prisma.ticket.createMany({ data: ticketsData }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
      include: { tickets: true }
    }),
  ]);

  const updatedOrder = transactionResult[1];
  console.log(`${ticketsData.length} tickets generados.`);

  const eventWithOrganizer = await prisma.event.findUnique({
    where: { id: event.id },
    include: { organizer: true }
  });

  if (eventWithOrganizer) {
      await sendTicketEmail({ user, event: eventWithOrganizer, order: updatedOrder });
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    isFree: true,
    ticketsGenerated: totalTicketsToGenerate,
  });
}