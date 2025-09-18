import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { sessionId, seatIds } = body;

    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        organizerId: true,
        title: true 
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    
    if (event.organizerId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "No autorizado para este evento" },
        { status: 403 }
      );
    }

    let result;

    if (sessionId) {
      
      result = await prisma.seatReservation.deleteMany({
        where: {
          sessionId,
          eventId,
          expiresAt: {
            gt: new Date() 
          }
        }
      });
    } else if (seatIds && Array.isArray(seatIds)) {
      
      result = await prisma.seatReservation.deleteMany({
        where: {
          eventId,
          seatId: { in: seatIds },
          expiresAt: {
            gt: new Date() 
          }
        }
      });
    } else {
      return NextResponse.json(
        { error: "Se requiere sessionId o seatIds" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Se liberaron ${result.count} reservas`,
      releasedCount: result.count
    });

  } catch (error) {
    console.error("Error releasing reservations:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        organizerId: true,
        title: true 
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    if (event.organizerId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "No autorizado para este evento" },
        { status: 403 }
      );
    }

    
    const activeReservations = await prisma.seatReservation.findMany({
      where: {
        eventId,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        seat: {
          select: {
            id: true,
            displayName: true,
            row: true,
            number: true,
            section: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      reservations: activeReservations.map(reservation => ({
        id: reservation.id,
        sessionId: reservation.sessionId,
        seatId: reservation.seatId,
        expiresAt: reservation.expiresAt,
        createdAt: reservation.createdAt,
        seat: reservation.seat
      }))
    });

  } catch (error) {
    console.error("Error getting reservations:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
