import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";


export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma";
import { validateQRCode } from "@/lib/qr";
import { canScanTickets } from "@/lib/roles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const { qrCode } = await params;

    
    if (!validateQRCode(qrCode)) {
      return NextResponse.json(
        { error: "Código QR inválido" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            organizer: {
              select: {
                id: true,
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

    const attendeeName = ticket.user.firstName
      ? `${ticket.user.firstName} ${ticket.user.lastName || ""}`.trim()
      : ticket.user.email;

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        qrCode: ticket.qrCode,
        isUsed: ticket.isUsed,
        usedAt: ticket.usedAt?.toISOString() || null,
        status: ticket.status,
        attendeeName,
        attendeeEmail: ticket.user.email,
        event: {
          ...ticket.event,
          startDate: ticket.event.startDate.toISOString(),
          endDate: ticket.event.endDate?.toISOString() || null,
        },
        order: ticket.order,
        createdAt: ticket.createdAt.toISOString(),
      },
      canUse: ticket.status === "ACTIVE" && !ticket.isUsed,
      isEventDay:
        new Date().toDateString() ===
        new Date(ticket.event.startDate).toDateString(),
    });
  } catch (error) {
    console.error("Error verifying ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    const { qrCode } = await params;
    const user = await requireAuth();

    if (!validateQRCode(qrCode)) {
      return NextResponse.json(
        { error: "Código QR inválido" },
        { status: 400 }
      );
    }

    if (!canScanTickets(user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para validar tickets" },
        { status: 403 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            organizerId: true,
            startDate: true,
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

    const hasPermission = await checkScanPermission(
      user.id,
      user.role,
      ticket.event.id,
      ticket.event.organizerId
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "No tienes permisos para validar tickets de este evento" },
        { status: 403 }
      );
    }

    if (ticket.isUsed) {
      return NextResponse.json(
        {
          error: "Este ticket ya fue usado",
          usedAt: ticket.usedAt?.toISOString(),
        },
        { status: 400 }
      );
    }

    if (ticket.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Ticket ${ticket.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const attendeeName = updatedTicket.user.firstName
      ? `${updatedTicket.user.firstName} ${
          updatedTicket.user.lastName || ""
        }`.trim()
      : updatedTicket.user.email;

    return NextResponse.json({
      message: "Ticket validado exitosamente",
      ticket: {
        id: updatedTicket.id,
        qrCode: updatedTicket.qrCode,
        isUsed: updatedTicket.isUsed,
        usedAt: updatedTicket.usedAt?.toISOString(),
        attendeeName,
        attendeeEmail: updatedTicket.user.email,
        eventTitle: ticket.event.title,
      },
    });
  } catch (error) {
    console.error("Error using ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

async function checkScanPermission(
  userId: string,
  userRole: string,
  eventId: string,
  eventOrganizerId: string
): Promise<boolean> {
  if (userRole === "ADMIN") {
    return true;
  }

  if (userRole === "ORGANIZER" && eventOrganizerId === userId) {
    return true;
  }

  if (userRole === "SCANNER") {
    const assignment = await prisma.eventScanner.findFirst({
      where: {
        eventId: eventId,
        scannerId: userId,
        isActive: true,
      },
    });

    return !!assignment;
  }

  return false;
}
