import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SeatStatus } from '@prisma/client';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: eventId, sectionId } = await params;

    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para generar asientos en este evento' },
        { status: 403 }
      );
    }

    
    const body = await request.json();
    const { rows, seatsPerRow, sectionName } = body;

    
    if (!rows || !seatsPerRow || rows < 1 || seatsPerRow < 1) {
      return NextResponse.json(
        { error: 'Parámetros inválidos. Se requieren filas y asientos por fila válidos.' },
        { status: 400 }
      );
    }

    if (rows > 50 || seatsPerRow > 100) {
      return NextResponse.json(
        { error: 'Límite excedido. Máximo 50 filas y 100 asientos por fila.' },
        { status: 400 }
      );
    }

    
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Sección no encontrada' },
        { status: 404 }
      );
    }

    
    if (section.eventId !== eventId) {
      return NextResponse.json(
        { error: 'La sección no pertenece a este evento' },
        { status: 400 }
      );
    }

    
    await prisma.eventSeat.deleteMany({
      where: { sectionId }
    });

    
    const seats = [];
    const totalSeats = rows * seatsPerRow;

    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const rowLetter = String.fromCharCode(64 + row); 
        const displayName = `${rowLetter}${seat}`;
        
        seats.push({
          sectionId,
          row: rowLetter,
          number: seat.toString(),
          displayName,
          price: section.basePrice || 0,
          status: SeatStatus.AVAILABLE,
        });
      }
    }

    
    const createdSeats = await prisma.eventSeat.createMany({
      data: seats
    });

    
    await prisma.section.update({
      where: { id: sectionId },
      data: {
        seatCount: totalSeats,
        rowCount: rows,
        seatsPerRow,
      }
    });
    
    return NextResponse.json({
      message: 'Asientos generados exitosamente',
      section: {
        id: sectionId,
        name: sectionName || section.name,
        totalSeats,
        rows,
        seatsPerRow,
      },
      seatsCreated: createdSeats.count,
      totalGenerated: seats.length,
    });

  } catch (error) {
    console.error('Error generating seats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: eventId, sectionId } = await params;

    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para ver los asientos de este evento' },
        { status: 403 }
      );
    }

    
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        seats: {
          orderBy: [
            { row: 'asc' },
            { number: 'asc' }
          ]
        }
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Sección no encontrada' },
        { status: 404 }
      );
    }

    
    if (section.eventId !== eventId) {
      return NextResponse.json(
        { error: 'La sección no pertenece a este evento' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      section: {
        id: section.id,
        name: section.name,
        eventId: section.eventId,
        seatCount: section.seatCount,
        rowCount: section.rowCount,
        seatsPerRow: section.seatsPerRow,
      },
      seats: section.seats,
      totalSeats: section.seats.length,
    });

  } catch (error) {
    console.error('Error fetching seats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
