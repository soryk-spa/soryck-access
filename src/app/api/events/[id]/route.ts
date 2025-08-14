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
  startDate: z.string().refine((date) => {
    const eventDate = new Date(date)
    const now = new Date()
    return eventDate > now
  }, 'La fecha debe ser en el futuro'),
  endDate: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  capacity: z.number().min(1, 'La capacidad debe ser mayor a 0').max(100000, 'Capacidad demasiado alta').optional(),
  price: z.number().min(0, 'El precio no puede ser negativo').max(1000000, 'Precio demasiado alto').optional(),
  isFree: z.boolean().default(false).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  // ✅ NUEVO: Manejar tipos de entrada en edición
  ticketTypes: z.array(ticketTypeEditSchema).min(1, 'Se requiere al menos un tipo de entrada.').optional(),
})

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
    const { id } = await params
    const { canAccess } = await canAccessEvent(id)
    
    if (!canAccess) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este evento' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    console.log('📝 Datos recibidos para edición:', JSON.stringify(body, null, 2))
    
    const validation = updateEventSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('❌ Errores de validación:', validation.error.issues)
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { ticketTypes, ...eventData } = validation.data

    // Verificar categoría
    const category = await prisma.category.findUnique({
      where: { id: eventData.categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 400 }
      )
    }

    // Validar fechas
    if (eventData.endDate) {
      const start = new Date(eventData.startDate)
      const end = new Date(eventData.endDate)
      
      if (end <= start) {
        return NextResponse.json(
          { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
          { status: 400 }
        )
      }
    }

    // ✅ NUEVO: Manejo inteligente de tipos de entrada

    if (ticketTypes && ticketTypes.length > 0) {
      console.log('🎫 Actualizando tipos de entrada:', ticketTypes)
      
      // Calcular capacidad total
      const totalCapacity = ticketTypes.reduce((sum, tt) => sum + (tt.capacity * tt.ticketsGenerated), 0)
      
      // Verificar que no se reduzca la capacidad por debajo de tickets vendidos
      const ticketsSold = await prisma.ticket.count({
        where: { eventId: id }
      })

      if (totalCapacity < ticketsSold) {
        return NextResponse.json(
          { error: `No puedes reducir la capacidad total por debajo de ${ticketsSold} (tickets ya vendidos)` },
          { status: 400 }
        )
      }

      // Usar transacción para actualizar evento y tipos de entrada
      await prisma.$transaction(async (tx) => {
        // 1. Actualizar evento principal
        const event = await tx.event.update({
          where: { id },
          data: {
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            startDate: new Date(eventData.startDate),
            endDate: eventData.endDate ? new Date(eventData.endDate) : null,
            categoryId: eventData.categoryId,
            capacity: totalCapacity,
            isFree: ticketTypes.every(tt => tt.price === 0),
            imageUrl: eventData.imageUrl || null
          }
        })

        // 2. Obtener tipos existentes
        const existingTypes = await tx.ticketType.findMany({
          where: { eventId: id },
          include: {
            _count: {
              select: { tickets: true }
            }
          }
        })

        // 3. Procesar cada tipo de entrada
        for (const ticketType of ticketTypes) {
          if (ticketType.id) {
            // Actualizar tipo existente
            const existingType = existingTypes.find(et => et.id === ticketType.id)
            if (existingType) {
              // Verificar que no se reduzca capacidad por debajo de tickets vendidos para este tipo
              const typeTicketsSold = existingType._count.tickets
              if (ticketType.capacity < typeTicketsSold) {
                throw new Error(`No puedes reducir la capacidad de "${ticketType.name}" por debajo de ${typeTicketsSold} (tickets ya vendidos para este tipo)`)
              }

              await tx.ticketType.update({
                where: { id: ticketType.id },
                data: {
                  name: ticketType.name,
                  description: ticketType.description,
                  price: ticketType.price,
                  capacity: ticketType.capacity,
                  // No actualizar ticketsGenerated si ya hay tickets vendidos
                  ...(typeTicketsSold === 0 && { ticketsGenerated: ticketType.ticketsGenerated }),
                }
              })
            }
          } else {
            // Crear nuevo tipo
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
            })
          }
        }

        // 4. Eliminar tipos que ya no están en la lista (solo si no tienen tickets vendidos)
        const submittedTypeIds = ticketTypes.map(tt => tt.id).filter(Boolean)
        const typesToDelete = existingTypes.filter(et => 
          !submittedTypeIds.includes(et.id) && et._count.tickets === 0
        )

        if (typesToDelete.length > 0) {
          await tx.ticketType.deleteMany({
            where: {
              id: { in: typesToDelete.map(tt => tt.id) }
            }
          })
        }

        return event
      })
    } else {
      // Solo actualizar evento sin tocar tipos de entrada
      await prisma.event.update({
        where: { id },
        data: {
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          startDate: new Date(eventData.startDate),
          endDate: eventData.endDate ? new Date(eventData.endDate) : null,
          categoryId: eventData.categoryId,
          imageUrl: eventData.imageUrl || null
        }
      })
    }

    // Obtener evento actualizado con relaciones
    const finalEvent = await prisma.event.findUnique({
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
              select: { tickets: true }
            }
          }
        }
      }
    })

    console.log('✅ Evento actualizado exitosamente')

    return NextResponse.json({
      message: 'Evento actualizado exitosamente',
      event: finalEvent
    })

  } catch (error) {
    console.error('❌ Error updating event:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
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