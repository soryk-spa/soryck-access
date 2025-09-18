import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// Ensure this API route runs dynamically so server-side auth can access the request
export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const whereClause: Record<string, unknown> = {
      userId: user.id,
    };

    if (eventId) {
      whereClause.eventId = eventId;
    }

    if (status === "active") {
      whereClause.status = "ACTIVE";
      whereClause.isUsed = false;
    } else if (status === "used") {
      whereClause.isUsed = true;
    } else if (status === "cancelled") {
      whereClause.status = { in: ["CANCELLED", "REFUNDED"] };
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            imageUrl: true,
            price: true,
            currency: true,
            isFree: true,
            organizer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            currency: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const serializedTickets = tickets.map((ticket) => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      usedAt: ticket.usedAt?.toISOString() || null,
      event: {
        ...ticket.event,
        startDate: ticket.event.startDate.toISOString(),
        endDate: ticket.event.endDate?.toISOString() || null,
      },
      order: {
        ...ticket.order,
        createdAt: ticket.order.createdAt.toISOString(),
      },
    }));

    return NextResponse.json({
      tickets: serializedTickets,
      total: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
