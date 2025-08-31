import { NextRequest, NextResponse } from 'next/server'
import { requireOrganizer, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema para validar cada objeto de tipo de entrada individualmente.
const ticketTypeSchema = z.object({
  name: z.string().min(1, 'El nombre del tipo de entrada es requerido').max(100),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  capacity: z.number().min(1, 'La capacidad debe ser al menos 1'),
  ticketsGenerated: z.number().min(1, 'Debe generar al menos 1 ticket').default(1),
});

// Esquema principal actualizado para la creación de eventos.
const createEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es demasiado largo'),
  description: z.string().optional().nullable(),
  location: z.string().min(1, 'La ubicación es requerida').max(200, 'La ubicación es demasiado larga'),
  startDate: z.string().refine((date) => {
    try {
      return new Date(date) > new Date();
    } catch {
      return false;
    }
  }, 'La fecha debe ser en el futuro'),
  endDate: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  imageUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal('')).nullable(),
  allowCourtesy: z.boolean().default(false),
  ticketTypes: z.array(ticketTypeSchema).min(1, 'Se requiere al menos un tipo de entrada.'),
});

const updateEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100),
  description: z.string().optional().nullable(),
  location: z.string().min(1, 'La ubicación es requerida').max(200),
  startDate: z.string().refine((date) => {
    const eventDate = new Date(date)
    const now = new Date()
    return eventDate > now
  }, 'La fecha debe ser en el futuro'),
  endDate: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  allowCourtesy: z.boolean().default(false),
  ticketTypes: z.array(ticketTypeSchema.extend({
    id: z.string().optional(), // Para updates
  })).min(1, 'Se requiere al menos un tipo de entrada.'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isPublic = searchParams.get('public') === 'true'

    let whereClause = {}

    if (isPublic) {
      whereClause = {
        isPublished: true,
        startDate: {
          gte: new Date()
        }
      }
    } else if (userId) {
      const user = await getCurrentUser()
      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no autenticado' },
          { status: 401 }
        )
      }
      
      whereClause = {
        organizerId: user.id
      }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
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
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // Serializar fechas
    const serializedEvents = events.map(event => ({
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
    }))

    return NextResponse.json({ events: serializedEvents })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireOrganizer()
    
    const body = await request.json()
    const validation = createEventSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { ticketTypes, ...eventData } = validation.data

    const category = await prisma.category.findUnique({
      where: { id: eventData.categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 400 }
      )
    }

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

    // Calcular la capacidad total sumando la capacidad de todos los tipos de entrada
    const totalCapacity = ticketTypes.reduce((sum, tt) => sum + (tt.capacity * tt.ticketsGenerated), 0);

    const event = await prisma.event.create({
      data: {
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        organizerId: user.id,
        isPublished: false,
        capacity: totalCapacity,
        price: 0, // Ya no es relevante, pero mantenemos para compatibilidad
        isFree: ticketTypes.every(tt => tt.price === 0),
        allowCourtesy: eventData.allowCourtesy,
        
        ticketTypes: {
          create: ticketTypes.map(tt => ({
            name: tt.name,
            description: tt.description,
            price: tt.price,
            capacity: tt.capacity,
            ticketsGenerated: tt.ticketsGenerated,
            currency: 'CLP',
          })),
        },
      },
      include: {
        category: true,
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        ticketTypes: true,
      }
    })

    // Serializar fechas para la respuesta
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

    return NextResponse.json({
      message: 'Evento creado exitosamente',
      event: serializedEvent
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating event:', error)
    
    if (error instanceof Error && error.message.includes('Acceso denegado')) {
      return NextResponse.json(
        { error: 'Solo organizadores y administradores pueden crear eventos' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT method para actualizar eventos
export async function PUT(request: NextRequest) {
  try {
    const user = await requireOrganizer()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'ID del evento requerido' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validation = updateEventSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { ticketTypes, ...eventData } = validation.data

    // Verificar permisos
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    if (existingEvent.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este evento' },
        { status: 403 }
      )
    }

    // Actualizar evento y tipos de entrada
    const totalCapacity = ticketTypes.reduce((sum, tt) => sum + (tt.capacity * tt.ticketsGenerated), 0);

    const updatedEvent = await prisma.$transaction(async (tx) => {
      // Actualizar evento principal
      const event = await tx.event.update({
        where: { id: eventId },
        data: {
          ...eventData,
          startDate: new Date(eventData.startDate),
          endDate: eventData.endDate ? new Date(eventData.endDate) : null,
          capacity: totalCapacity,
          isFree: ticketTypes.every(tt => tt.price === 0),
        }
      })

      // Manejar tipos de entrada (simplificado: eliminar todos y recrear)
      await tx.ticketType.deleteMany({
        where: { 
          eventId: eventId,
          tickets: { none: {} } // Solo eliminar tipos sin tickets vendidos
        }
      })

      // Crear nuevos tipos de entrada
      await tx.ticketType.createMany({
        data: ticketTypes.map(tt => ({
          eventId: eventId,
          name: tt.name,
          description: tt.description,
          price: tt.price,
          capacity: tt.capacity,
          ticketsGenerated: tt.ticketsGenerated,
          currency: 'CLP',
        }))
      })

      return event
    })

    return NextResponse.json({
      message: 'Evento actualizado exitosamente',
      event: updatedEvent
    })

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}