import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { webpayPlus } from "@/lib/transbank";
import { generateUniqueQRCode } from "@/lib/qr";
import { calculatePriceBreakdown } from "@/lib/commission";
import { z } from "zod";

const createPaymentSchema = z.object({
  eventId: z.string(),
  quantity: z.number().min(1).max(10),
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

  if (buyOrder.length > 26) {
    console.warn(
      `buyOrder demasiado largo: ${buyOrder.length} caracteres. Recortando...`
    );
    return buyOrder.substring(0, 26);
  }

  console.log(`buyOrder generado: ${buyOrder} (${buyOrder.length} caracteres)`);
  return buyOrder;
}

function generateShortSessionId(prefix: string = "sess"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);

  const sessionId = `${prefix}-${timestamp}-${random}`;

  if (sessionId.length > 61) {
    console.warn(
      `sessionId demasiado largo: ${sessionId.length} caracteres. Recortando...`
    );
    return sessionId.substring(0, 61);
  }

  console.log(
    `sessionId generado: ${sessionId} (${sessionId.length} caracteres)`
  );
  return sessionId;
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO DE CREACIÓN DE PAGO CON COMISIÓN ===");

    const user = await requireAuth();
    console.log("Usuario autenticado:", { userId: user.id, email: user.email });

    const body = await request.json();
    console.log("Body recibido:", body);

    const validation = createPaymentSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validación fallida:", validation.error);
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { eventId, quantity } = validation.data;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!event || !event.isPublished) {
      console.error("Evento no encontrado o no publicado:", { eventId, event });
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    console.log("Evento encontrado:", {
      id: event.id,
      title: event.title,
      basePrice: event.price,
      capacity: event.capacity,
      ticketsSold: event._count.tickets,
      isFree: event.isFree,
    });

    const availableTickets = event.capacity - event._count.tickets;
    if (quantity > availableTickets) {
      console.error("No hay suficientes tickets:", {
        quantity,
        availableTickets,
      });
      return NextResponse.json(
        { error: "No hay suficientes tickets disponibles" },
        { status: 400 }
      );
    }

    // Calcular precios con comisión
    const basePrice = event.price;
    const baseTotalAmount = basePrice * quantity;
    const priceBreakdown = calculatePriceBreakdown(
      baseTotalAmount,
      event.currency
    );
    const finalTotalAmount = priceBreakdown.totalPrice;

    console.log("Cálculo de precios:", {
      basePrice,
      quantity,
      baseTotalAmount,
      commission: priceBreakdown.commission,
      finalTotalAmount,
      isFree: event.isFree,
      breakdown: priceBreakdown,
    });

    const orderNumber = generateShortBuyOrder("SP");
    console.log(
      "Número de orden generado:",
      orderNumber,
      "Longitud:",
      orderNumber.length
    );

    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: finalTotalAmount, // Guardar el precio final con comisión
        baseAmount: baseTotalAmount, // Guardar también el precio base
        commissionAmount: priceBreakdown.commission, // Guardar la comisión
        currency: event.currency,
        quantity,
        status: "PENDING",
        userId: user.id,
        eventId: event.id,
      },
    });

    console.log("Orden creada en BD:", {
      id: order.id,
      orderNumber: order.orderNumber,
      baseAmount: order.baseAmount,
      commissionAmount: order.commissionAmount,
      totalAmount: order.totalAmount,
      status: order.status,
    });

    if (event.isFree || finalTotalAmount === 0) {
      console.log("Evento gratuito, procesando tickets directamente");
      return handleFreeTickets(order, event, user);
    }

    const sessionId = generateShortSessionId("sess");
    const buyOrder = order.orderNumber;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/transbank/return`;

    console.log("Parámetros para Transbank:", {
      buyOrder: buyOrder,
      buyOrderLength: buyOrder.length,
      sessionId: sessionId,
      sessionIdLength: sessionId.length,
      finalTotalAmount: finalTotalAmount,
      returnUrl: returnUrl,
    });

    if (!buyOrder || buyOrder.length > 26) {
      console.error("buyOrder inválido:", {
        buyOrder,
        length: buyOrder?.length,
      });
      return NextResponse.json(
        { error: "Número de orden inválido" },
        { status: 400 }
      );
    }

    if (!sessionId || sessionId.length > 61) {
      console.error("sessionId inválido:", {
        sessionId,
        length: sessionId?.length,
      });
      return NextResponse.json(
        { error: "ID de sesión inválido" },
        { status: 400 }
      );
    }

    if (finalTotalAmount <= 0 || finalTotalAmount > 999999999) {
      console.error("Monto inválido:", finalTotalAmount);
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    console.log("=== LLAMANDO A TRANSBANK ===");

    let transbankResponse;
    try {
      transbankResponse = await webpayPlus.create(
        buyOrder,
        sessionId,
        finalTotalAmount, // Enviar el precio final con comisión a Transbank
        returnUrl
      );

      console.log("Respuesta de Transbank:", {
        token: transbankResponse.token,
        url: transbankResponse.url,
        responseType: typeof transbankResponse,
      });
    } catch (transbankError) {
      console.error("Error específico de Transbank:", {
        error: transbankError,
        message:
          transbankError instanceof Error
            ? transbankError.message
            : "Error desconocido",
        stack:
          transbankError instanceof Error ? transbankError.stack : undefined,
      });

      return NextResponse.json(
        {
          error: "Error al crear la transacción con Transbank",
          details:
            transbankError instanceof Error
              ? transbankError.message
              : "Error desconocido",
        },
        { status: 500 }
      );
    }

    if (!transbankResponse.token || !transbankResponse.url) {
      console.error("Respuesta inválida de Transbank:", transbankResponse);
      return NextResponse.json(
        { error: "Respuesta inválida de Transbank" },
        { status: 500 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId: sessionId,
        token: transbankResponse.token,
        amount: finalTotalAmount, // Guardar el monto final
        currency: event.currency,
        status: "PENDING",
      },
    });

    console.log("Pago guardado en BD:", {
      id: payment.id,
      token: payment.token,
      amount: payment.amount,
      status: payment.status,
    });

    console.log("=== TRANSACCIÓN CREADA EXITOSAMENTE ===");
    console.log("🎫 TOKEN PARA FORMULARIO TRANSBANK:", transbankResponse.token);
    console.log("🌐 URL de redirección:", transbankResponse.url);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl: transbankResponse.url,
      token: transbankResponse.token,
      priceBreakdown: {
        baseAmount: baseTotalAmount,
        commission: priceBreakdown.commission,
        totalAmount: finalTotalAmount,
        commissionRate: "6%",
      },
      debug: {
        buyOrder,
        sessionId,
        finalTotalAmount,
        returnUrl,
        validations: {
          buyOrderLength: `${buyOrder.length}/26`,
          sessionIdLength: `${sessionId.length}/61`,
          amountValid: finalTotalAmount > 0 && finalTotalAmount <= 999999999,
        },
      },
    });
  } catch (error) {
    console.error("=== ERROR GENERAL EN CREACIÓN DE PAGO ===");
    console.error("Error completo:", {
      error,
      message: error instanceof Error ? error.message : "Error desconocido",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

async function handleFreeTickets(
  order: {
    id: string;
    quantity: number;
  },
  event: {
    id: string;
    title: string;
  },
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  }
) {
  console.log("Procesando tickets gratuitos...");

  const timestamp = Date.now();
  const tickets = [];

  for (let i = 0; i < order.quantity; i++) {
    const qrCode = generateUniqueQRCode(event.id, user.id, timestamp, i);
    tickets.push({
      qrCode,
      eventId: event.id,
      userId: user.id,
      orderId: order.id,
    });
  }

  await prisma.$transaction([
    prisma.ticket.createMany({ data: tickets }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    }),
  ]);

  console.log("Tickets gratuitos creados:", tickets.length);

  return NextResponse.json({
    success: true,
    orderId: order.id,
    isFree: true,
    ticketsGenerated: order.quantity,
    tickets: tickets.map((t) => ({ qrCode: t.qrCode })),
  });
}
