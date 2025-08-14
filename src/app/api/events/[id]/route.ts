import { NextRequest, NextResponse } from 'next/server'
import { canAccessEvent, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema para tipos de entrada en edición
const ticketTypeEditSchema = z.object({
  id: z.string().optional(), // Para tipos existentes
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
  startDate: z.string(), // Aceptamos el string del formulario
  endDate: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  ticketTypes: z.array(ticketTypeEditSchema).min(1, 'Se requiere al menos un tipo de entrada.').optional(),
})

// ... (La función GET se mantiene igual)
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
  
      // Serializar fechas
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
    const validation = updateEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { ticketTypes, ...eventData } = validation.data;

    // *** INICIO DE LA CORRECCIÓN DE ZONA HORARIA ***
    // El string del input 'datetime-local' no tiene timezone.
    // Le añadimos el offset de Chile (CLT, UTC-4) para que new Date() lo interprete correctamente.
    // NOTA: Esto no maneja el horario de verano (CLST, UTC-3) automáticamente. Para eso se necesitaría una librería.
    const CHILE_OFFSET = "-04:00";
    const startDate = new Date(eventData.startDate + CHILE_OFFSET);
    const endDate = eventData.endDate ? new Date(eventData.endDate + CHILE_OFFSET) : null;
    
    // Validamos las fechas después de convertirlas
    if (startDate <= new Date()) {
      return NextResponse.json({ error: "La fecha de inicio debe ser en el futuro" }, { status: 400 });
    }
    if (endDate && endDate <= startDate) {
      return NextResponse.json({ error: "La fecha de fin debe ser posterior a la de inicio" }, { status: 400 });
    }
    // *** FIN DE LA CORRECCIÓN ***

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
        await tx.event.update({
          where: { id },
          data: {
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            startDate: startDate, // Usamos la fecha corregida
            endDate: endDate,     // Usamos la fecha corregida
            categoryId: eventData.categoryId,
            capacity: totalCapacity,
            isFree: ticketTypes.every(tt => tt.price === 0),
            imageUrl: eventData.imageUrl || null
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
    }

    const finalEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        organizer: true,
        ticketTypes: { include: { _count: { select: { tickets: true } } } }
      }
    });

    return NextResponse.json({
      message: 'Evento actualizado exitosamente',
      event: finalEvent
    });

  } catch (error) {
    console.error('Error updating event:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}


// ... (La función DELETE se mantiene igual)

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