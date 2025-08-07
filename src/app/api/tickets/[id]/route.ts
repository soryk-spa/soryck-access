import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTicketQR, TicketQRData } from "@/lib/qr";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const ticket = await prisma.ticket.findFirst({
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
            organizer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            currency: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    const ticketQRData: TicketQRData = {
      ticketId: ticket.id,
      eventId: ticket.event.id,
      userId: ticket.user.email,
      eventTitle: ticket.event.title,
      attendeeName: ticket.user.firstName
        ? `${ticket.user.firstName} ${ticket.user.lastName || ""}`.trim()
        : ticket.user.email,
      attendeeEmail: ticket.user.email,
      eventDate: ticket.event.startDate.toISOString(),
      eventLocation: ticket.event.location,
      qrCode: ticket.qrCode,
      timestamp: ticket.createdAt.toISOString(),
    };

    const qrCodeDataUrl = await generateTicketQR(ticketQRData);

    return NextResponse.json({
      ticket: {
        ...ticket,
        qrCodeImage: qrCodeDataUrl,
        event: {
          ...ticket.event,
          startDate: ticket.event.startDate.toISOString(),
        },
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        usedAt: ticket.usedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
