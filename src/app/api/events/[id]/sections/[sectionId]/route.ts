import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
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
        color: section.color,
        basePrice: section.basePrice,
        seatCount: section.seatCount,
        rowCount: section.rowCount,
        seatsPerRow: section.seatsPerRow,
        hasSeats: section.hasSeats,
        description: section.description,
        eventId: section.eventId,
      },
      seats: section.seats,
      totalSeats: section.seats.length,
    });

  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: eventId, sectionId } = await params;

    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para editar secciones de este evento' },
        { status: 403 }
      );
    }

    
    const existingSection = await prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!existingSection) {
      return NextResponse.json(
        { error: 'Sección no encontrada' },
        { status: 404 }
      );
    }

    if (existingSection.eventId !== eventId) {
      return NextResponse.json(
        { error: 'La sección no pertenece a este evento' },
        { status: 400 }
      );
    }

    
    const body = await request.json();
    const { 
      name, 
      color, 
      basePrice, 
      hasSeats, 
      description 
    } = body;

    
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(basePrice !== undefined && { basePrice }),
        ...(hasSeats !== undefined && { hasSeats }),
        ...(description !== undefined && { description }),
      }
    });

    return NextResponse.json({
      message: 'Sección actualizada exitosamente',
      section: updatedSection,
    });

  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: eventId, sectionId } = await params;

    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar secciones de este evento' },
        { status: 403 }
      );
    }

    
    const existingSection = await prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!existingSection) {
      return NextResponse.json(
        { error: 'Sección no encontrada' },
        { status: 404 }
      );
    }

    if (existingSection.eventId !== eventId) {
      return NextResponse.json(
        { error: 'La sección no pertenece a este evento' },
        { status: 400 }
      );
    }

    
    await prisma.section.delete({
      where: { id: sectionId }
    });

    return NextResponse.json({
      message: 'Sección eliminada exitosamente',
    });

  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
