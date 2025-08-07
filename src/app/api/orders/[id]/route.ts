import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
            imageUrl: true,
          },
        },
        tickets: {
          select: {
            id: true,
            qrCode: true,
            status: true,
            isUsed: true,
            createdAt: true,
          },
        },
        payment: {
          select: {
            status: true,
            transactionDate: true,
            authorizationCode: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    const serializedOrder = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      event: {
        ...order.event,
        startDate: order.event.startDate.toISOString(),
      },
      tickets: order.tickets.map((ticket) => ({
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
      })),
      payment: order.payment
        ? {
            ...order.payment,
            transactionDate:
              order.payment.transactionDate?.toISOString() || null,
          }
        : null,
    };

    return NextResponse.json({
      order: serializedOrder,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
