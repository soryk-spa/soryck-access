import { NextRequest, NextResponse } from 'next/server'
import { requireOrganizer, getCurrentUser } from '@/lib/auth'

// Ensure this API route runs dynamically so server-side auth can access the request
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { CacheInvalidation } from '@/lib/cache-invalidation'

const priceTierSchema = z.object({
  name: z.string().min(1, 'El nombre del nivel de precio es requerido').max(100),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  startDate: z.string().refine((date) => {
    try {
      return new Date(date);
    } catch {
      return false;
    }
  }, 'Fecha de inicio inválida'),
  endDate: z.string().refine((date) => {
    try {
      return new Date(date);
    } catch {
      return false;
    }
  }, 'Fecha de fin inválida'),
});

const ticketTypeSchema = z.object({
  name: z.string().min(1, 'El nombre del tipo de entrada es requerido').max(100),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  capacity: z.number().min(1, 'La capacidad debe ser al menos 1'),
  ticketsGenerated: z.number().min(1, 'Debe generar al menos 1 ticket').default(1),
  priceTiers: z.array(priceTierSchema).optional().default([]),
});


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
    id: z.string().optional(), 
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
            },
            priceTiers: true
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
        priceTiers: tt.priceTiers.map(tier => ({
          ...tier,
          startDate: tier.startDate.toISOString(),
          endDate: tier.endDate?.toISOString() || null,
          createdAt: tier.createdAt.toISOString(),
          updatedAt: tier.updatedAt.toISOString(),
        }))
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
    console.log('🔵 [EVENT CREATE] Iniciando creación de evento...')
    
    const user = await requireOrganizer()
    console.log('✅ [EVENT CREATE] Usuario autenticado:', { id: user.id, email: user.email, role: user.role })
    
    const body = await request.json()
    console.log('📝 [EVENT CREATE] Datos recibidos:', JSON.stringify(body, null, 2))
    
    const validation = createEventSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('❌ [EVENT CREATE] Errores de validación:', JSON.stringify(validation.error.issues, null, 2))
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    console.log('✅ [EVENT CREATE] Validación exitosa')
    const { ticketTypes, ...eventData } = validation.data
    console.log('📊 [EVENT CREATE] Datos del evento:', JSON.stringify(eventData, null, 2))
    console.log('🎫 [EVENT CREATE] Tipos de tickets:', JSON.stringify(ticketTypes, null, 2))

    const category = await prisma.category.findUnique({
      where: { id: eventData.categoryId }
    })

    if (!category) {
      console.error('❌ [EVENT CREATE] Categoría no encontrada:', eventData.categoryId)
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 400 }
      )
    }

    console.log('✅ [EVENT CREATE] Categoría encontrada:', category.name)

    if (eventData.endDate) {
      const start = new Date(eventData.startDate)
      const end = new Date(eventData.endDate)
      console.log('📅 [EVENT CREATE] Validando fechas - Inicio:', start, 'Fin:', end)
      
      if (end <= start) {
        console.error('❌ [EVENT CREATE] Fecha de fin debe ser posterior a la de inicio')
        return NextResponse.json(
          { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
          { status: 400 }
        )
      }
    }

    
    const totalCapacity = ticketTypes.reduce((sum, tt) => sum + (tt.capacity * tt.ticketsGenerated), 0);
    console.log('📊 [EVENT CREATE] Capacidad total calculada:', totalCapacity)

    console.log('🚀 [EVENT CREATE] Iniciando transacción de base de datos...')
    const result = await prisma.$transaction(async (tx) => {
      console.log('📝 [EVENT CREATE] Creando evento principal...')
      const event = await tx.event.create({
        data: {
          ...eventData,
          startDate: new Date(eventData.startDate),
          endDate: eventData.endDate ? new Date(eventData.endDate) : null,
          organizerId: user.id,
          isPublished: false,
          capacity: totalCapacity,
          price: 0, 
          isFree: ticketTypes.every(tt => tt.price === 0),
          allowCourtesy: eventData.allowCourtesy,
        }
      })
      console.log('✅ [EVENT CREATE] Evento principal creado:', event.id)

      // Create ticket types with price tiers
      console.log('🎫 [EVENT CREATE] Creando tipos de tickets...')
      const createdTicketTypes = []
      for (const [index, tt] of ticketTypes.entries()) {
        console.log(`📝 [EVENT CREATE] Creando ticket type ${index + 1}:`, tt.name)
        
        try {
          const ticketType = await tx.ticketType.create({
            data: {
              eventId: event.id,
              name: tt.name,
              description: tt.description,
              price: tt.price,
              capacity: tt.capacity,
              ticketsGenerated: tt.ticketsGenerated,
              currency: 'CLP',
            }
          })
          console.log(`✅ [EVENT CREATE] Ticket type creado:`, ticketType.id)

          // Create price tiers if any
          if (tt.priceTiers && tt.priceTiers.length > 0) {
            console.log(`💰 [EVENT CREATE] Creando ${tt.priceTiers.length} price tiers para ticket type:`, ticketType.id)
            
            try {
              await tx.priceTier.createMany({
                data: tt.priceTiers.map(tier => ({
                  ticketTypeId: ticketType.id,
                  name: tier.name,
                  price: tier.price,
                  startDate: new Date(tier.startDate),
                  endDate: new Date(tier.endDate),
                }))
              })
              console.log(`✅ [EVENT CREATE] Price tiers creados para ticket type:`, ticketType.id)
            } catch (tierError) {
              console.error(`❌ [EVENT CREATE] Error creando price tiers:`, tierError)
              throw tierError
            }
          } else {
            console.log(`ℹ️ [EVENT CREATE] No hay price tiers para ticket type:`, ticketType.id)
          }

          createdTicketTypes.push(ticketType)
        } catch (ticketError) {
          console.error(`❌ [EVENT CREATE] Error creando ticket type ${index + 1}:`, ticketError)
          throw ticketError
        }
      }

      console.log('📊 [EVENT CREATE] Obteniendo evento completo con relaciones...')
      console.log('📊 [EVENT CREATE] Obteniendo evento completo con relaciones...')
      // Get the complete event with relationships
      const completeEvent = await tx.event.findUnique({
        where: { id: event.id },
        include: {
          category: true,
          organizer: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          ticketTypes: {
            include: {
              priceTiers: true
            }
          },
        }
      })
      
      console.log('✅ [EVENT CREATE] Evento completo obtenido:', completeEvent?.id)
      return completeEvent
    })

    if (!result) {
      console.error('❌ [EVENT CREATE] Resultado de transacción es null')
      throw new Error('Failed to create event')
    }

    console.log('🎉 [EVENT CREATE] Evento creado exitosamente:', result.id)

    
    const serializedEvent = {
      ...result,
      startDate: result.startDate.toISOString(),
      endDate: result.endDate?.toISOString() || null,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      ticketTypes: result.ticketTypes.map(tt => ({
        ...tt,
        createdAt: tt.createdAt.toISOString(),
        updatedAt: tt.updatedAt.toISOString(),
        priceTiers: tt.priceTiers.map(tier => ({
          ...tier,
          startDate: tier.startDate.toISOString(),
          endDate: tier.endDate?.toISOString() || null,
          createdAt: tier.createdAt.toISOString(),
          updatedAt: tier.updatedAt.toISOString(),
        }))
      }))
    }

    console.log('📤 [EVENT CREATE] Enviando respuesta exitosa')
    
    // Invalidar caché de eventos para mostrar el nuevo evento
    await CacheInvalidation.invalidateEventsCache();
    
    return NextResponse.json({
      message: 'Evento creado exitosamente',
      event: serializedEvent
    }, { status: 201 })

  } catch (error) {
    console.error('❌ [EVENT CREATE] Error creando evento:', error)
    
    // Log detallado del error
    if (error instanceof Error) {
      console.error('❌ [EVENT CREATE] Mensaje del error:', error.message)
      console.error('❌ [EVENT CREATE] Stack trace:', error.stack)
    }
    
    // Log del error como objeto si no es instancia de Error
    if (!(error instanceof Error)) {
      console.error('❌ [EVENT CREATE] Error no es instancia de Error:', JSON.stringify(error, null, 2))
    }
    
    // Si es un error de Prisma, log información específica
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code?: string; meta?: unknown }
      console.error('❌ [EVENT CREATE] Código de error de Prisma:', prismaError.code)
      console.error('❌ [EVENT CREATE] Meta información:', prismaError.meta)
    }
    
    if (error instanceof Error && error.message.includes('Acceso denegado')) {
      return NextResponse.json(
        { error: 'Solo organizadores y administradores pueden crear eventos' },
        { status: 403 }
      )
    }

    // Devolver información más específica del error en desarrollo
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        ...(isDevelopment && error instanceof Error && {
          details: error.message,
          stack: error.stack
        })
      },
      { status: 500 }
    )
  }
}


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

    
    const totalCapacity = ticketTypes.reduce((sum, tt) => sum + (tt.capacity * tt.ticketsGenerated), 0);

    const updatedEvent = await prisma.$transaction(async (tx) => {
      
      await tx.event.update({
        where: { id: eventId },
        data: {
          ...eventData,
          startDate: new Date(eventData.startDate),
          endDate: eventData.endDate ? new Date(eventData.endDate) : null,
          capacity: totalCapacity,
          isFree: ticketTypes.every(tt => tt.price === 0),
        }
      })

      
      await tx.ticketType.deleteMany({
        where: { 
          eventId: eventId,
          tickets: { none: {} } 
        }
      })

      
      for (const tt of ticketTypes) {
        const ticketType = await tx.ticketType.create({
          data: {
            eventId: eventId,
            name: tt.name,
            description: tt.description,
            price: tt.price,
            capacity: tt.capacity,
            ticketsGenerated: tt.ticketsGenerated,
            currency: 'CLP',
          }
        })

        // Create price tiers if any
        if (tt.priceTiers && tt.priceTiers.length > 0) {
          await tx.priceTier.createMany({
            data: tt.priceTiers.map(tier => ({
              ticketTypeId: ticketType.id,
              name: tier.name,
              price: tier.price,
              startDate: new Date(tier.startDate),
              endDate: new Date(tier.endDate),
            }))
          })
        }
      }

      // Get the complete event with relationships
      return await tx.event.findUnique({
        where: { id: eventId },
        include: {
          category: true,
          organizer: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          ticketTypes: {
            include: {
              priceTiers: true
            }
          },
        }
      })
    })

    if (!updatedEvent) {
      throw new Error('Failed to update event')
    }

    // Serialize the response
    const serializedEvent = {
      ...updatedEvent,
      startDate: updatedEvent.startDate.toISOString(),
      endDate: updatedEvent.endDate?.toISOString() || null,
      createdAt: updatedEvent.createdAt.toISOString(),
      updatedAt: updatedEvent.updatedAt.toISOString(),
      ticketTypes: updatedEvent.ticketTypes.map(tt => ({
        ...tt,
        createdAt: tt.createdAt.toISOString(),
        updatedAt: tt.updatedAt.toISOString(),
        priceTiers: tt.priceTiers.map(tier => ({
          ...tier,
          startDate: tier.startDate.toISOString(),
          endDate: tier.endDate?.toISOString() || null,
          createdAt: tier.createdAt.toISOString(),
          updatedAt: tier.updatedAt.toISOString(),
        }))
      }))
    }

    return NextResponse.json({
      message: 'Evento actualizado exitosamente',
      event: serializedEvent
    })

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}