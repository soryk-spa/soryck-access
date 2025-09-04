
import { NextRequest, NextResponse } from 'next/server'
import { canAccessEvent, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'


const ticketTypeEditSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre del tipo de entrada es requerido').max(100),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  capacity: z.number().min(1, 'La capacidad debe ser al menos 1'),
  ticketsGenerated: z.number().min(1, 'Debe generar al menos 1 ticket').default(1),
});

const updateEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es demasiado largo'),
  description: z.string().optional().nullable(),
  location: z.string().min(1, 'La ubicación es requerida').max(200, 'La ubicación es demasiado larga'),
  startDate: z.string().refine((dateStr) => {
    try {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) && date > new Date();
    } catch {
      return false;
    }
  }, 'La fecha de inicio debe ser válida y en el futuro'),
  endDate: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  allowCourtesy: z.boolean().default(false),
  courtesyLimit: z.number().min(1).nullable().optional(),
  courtesyValidUntil: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (use HH:mm)').nullable().optional(),
  courtesyPriceAfter: z.number().min(0, 'El precio debe ser mayor o igual a 0').nullable().optional(),
  ticketTypes: z.array(ticketTypeEditSchema).min(1, 'Se requiere al menos un tipo de entrada.').optional(),
}).refine((data) => {
  if (data.endDate) {
    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return endDate > startDate;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate']
}).refine((data) => {
  
  if (data.allowCourtesy && (!data.courtesyLimit || data.courtesyLimit <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'El límite de cortesías debe ser mayor a 0 cuando están habilitadas',
  path: ['courtesyLimit']
}).refine((data) => {
  
  if (data.allowCourtesy && data.courtesyValidUntil && (!data.courtesyPriceAfter || data.courtesyPriceAfter < 0)) {
    return false;
  }
  return true;
}, {
  message: 'El precio después de la hora límite es requerido cuando se define una hora límite para cortesías',
  path: ['courtesyPriceAfter']
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        ticketTypes: {
          include: {
            _count: {
              select: {
                tickets: true
              }
            }
          }
        },
        _count: {
          select: {
            tickets: true,
            orders: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    const user = await getCurrentUser()
    const isPublic = event.isPublished
    const isOwner = user && event.organizerId === user.id
    const isAdmin = user && user.role === 'ADMIN'

    if (!isPublic && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver este evento' },
        { status: 403 }
      )
    }

    
    const serializedEvent = {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() || null,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      ticketTypes: event.ticketTypes.map(tt => ({
        ...tt,
        createdAt: tt.createdAt.toISOString(),
        updatedAt: tt.updatedAt.toISOString(),
      }))
    }

    return NextResponse.json({ event: serializedEvent })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { canAccess } = await canAccessEvent(id);

    if (!canAccess) {
      return NextResponse.json(
        { error: "No tienes permisos para editar este evento" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('📥 Datos recibidos en API:', JSON.stringify(body, null, 2));
    
    const validation = updateEventSchema.safeParse(body);

    if (!validation.success) {
      console.error('❌ Validación fallida:', validation.error.issues);
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { ticketTypes, ...eventData } = validation.data;

    
    
    const startDate = new Date(eventData.startDate);
    const endDate = eventData.endDate ? new Date(eventData.endDate) : null;
    
    console.log('📅 Fechas procesadas:', {
      startDate: startDate.toISOString(),
      endDate: endDate?.toISOString() || null,
      startDateLocal: startDate.toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
      endDateLocal: endDate?.toLocaleString('es-CL', { timeZone: 'America/Santiago' }) || null
    });

    
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Fecha de inicio inválida" }, { status: 400 });
    }

    if (startDate <= new Date()) {
      return NextResponse.json({ error: "La fecha de inicio debe ser en el futuro" }, { status: 400 });
    }

    if (endDate && (isNaN(endDate.getTime()) || endDate <= startDate)) {
      return NextResponse.json({ error: "La fecha de fin debe ser posterior a la de inicio" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: eventData.categoryId },
    });
    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 400 });
    }
    
    if (ticketTypes && ticketTypes.length > 0) {
      const totalCapacity = ticketTypes.reduce((sum, tt) => sum + (tt.capacity * tt.ticketsGenerated), 0);
      
      const ticketsSold = await prisma.ticket.count({ where: { eventId: id } });

      if (totalCapacity < ticketsSold) {
        return NextResponse.json(
          { error: `No puedes reducir la capacidad total por debajo de ${ticketsSold} (tickets ya vendidos)` },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        
        console.log('🖼️ Updating imageUrl to:', eventData.imageUrl);
        await tx.event.update({
          where: { id },
          data: {
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            startDate: startDate, 
            endDate: endDate,     
            categoryId: eventData.categoryId,
            capacity: totalCapacity,
            isFree: ticketTypes.every(tt => tt.price === 0),
            imageUrl: eventData.imageUrl || null,
            allowCourtesy: eventData.allowCourtesy,
            courtesyLimit: eventData.allowCourtesy ? eventData.courtesyLimit : null,
            courtesyValidUntil: eventData.allowCourtesy ? eventData.courtesyValidUntil : null,
            courtesyPriceAfter: eventData.allowCourtesy && eventData.courtesyValidUntil ? eventData.courtesyPriceAfter : null,
          }
        });

        const existingTypes = await tx.ticketType.findMany({
          where: { eventId: id },
          include: { _count: { select: { tickets: true } } }
        });

        for (const ticketType of ticketTypes) {
          if (ticketType.id) {
            const existingType = existingTypes.find(et => et.id === ticketType.id);
            if (existingType) {
              const typeTicketsSold = existingType._count.tickets;
              if (ticketType.capacity < typeTicketsSold) {
                throw new Error(`No puedes reducir la capacidad de "${ticketType.name}" por debajo de ${typeTicketsSold}`);
              }

              await tx.ticketType.update({
                where: { id: ticketType.id },
                data: {
                  name: ticketType.name,
                  description: ticketType.description,
                  price: ticketType.price,
                  capacity: ticketType.capacity,
                  ...(typeTicketsSold === 0 && { ticketsGenerated: ticketType.ticketsGenerated }),
                }
              });
            }
          } else {
            await tx.ticketType.create({
              data: {
                eventId: id,
                name: ticketType.name,
                description: ticketType.description,
                price: ticketType.price,
                capacity: ticketType.capacity,
                ticketsGenerated: ticketType.ticketsGenerated,
                currency: 'CLP',
              }
            });
          }
        }

        const submittedTypeIds = ticketTypes.map(tt => tt.id).filter(Boolean);
        const typesToDelete = existingTypes.filter(et => 
          !submittedTypeIds.includes(et.id) && et._count.tickets === 0
        );

        if (typesToDelete.length > 0) {
          await tx.ticketType.deleteMany({
            where: { id: { in: typesToDelete.map(tt => tt.id) } }
          });
        }
      });
    } else {
      
      await prisma.event.update({
        where: { id },
        data: {
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          startDate: startDate,
          endDate: endDate,
          categoryId: eventData.categoryId,
          imageUrl: eventData.imageUrl || null,
          allowCourtesy: eventData.allowCourtesy,
          courtesyLimit: eventData.allowCourtesy ? eventData.courtesyLimit : null,
          courtesyValidUntil: eventData.allowCourtesy ? eventData.courtesyValidUntil : null,
          courtesyPriceAfter: eventData.allowCourtesy && eventData.courtesyValidUntil ? eventData.courtesyPriceAfter : null,
        }
      });
    }

    const finalEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        organizer: true,
        ticketTypes: { include: { _count: { select: { tickets: true } } } }
      }
    });

    console.log('✅ Evento actualizado exitosamente');

    return NextResponse.json({
      message: 'Evento actualizado exitosamente',
      event: finalEvent
    });

  } catch (error) {
    console.error('❌ Error updating event:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { canAccess } = await canAccessEvent(id)
    
    if (!canAccess) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este evento' },
        { status: 403 }
      )
    }

    const ticketsCount = await prisma.ticket.count({
      where: { eventId: id }
    })

    if (ticketsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el evento porque tiene ${ticketsCount} ticket(s) vendido(s)` },
        { status: 400 }
      )
    }

    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Evento eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}