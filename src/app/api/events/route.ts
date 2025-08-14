import { NextRequest, NextResponse } from 'next/server'
import { requireOrganizer, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema para validar cada objeto de tipo de entrada individualmente.
const ticketTypeSchema = z.object({
  name: z.string().min(1, 'El nombre del tipo de entrada es requerido').max(100),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  capacity: z.number().min(1, 'La capacidad debe ser al menos 1'),
  ticketsGenerated: z.number().min(1, 'Debe generar al menos 1 ticket').default(1),
});

// Esquema principal actualizado para la creación de eventos.
// Ya no espera 'price', 'capacity' o 'isFree' en el nivel superior.
// En su lugar, espera un array de 'ticketTypes'.
const createEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es demasiado largo'),
  description: z.string().optional(),
  location: z.string().min(1, 'La ubicación es requerida').max(200, 'La ubicación es demasiado larga'),
  startDate: z.string().refine((date) => {
    // Asegura que la fecha proporcionada no esté en el pasado.
    try {
      return new Date(date) > new Date();
    } catch {
      return false;
    }
  }, 'La fecha debe ser en el futuro'),
  endDate: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  imageUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal('')),
  // La clave del cambio: ahora validamos un array de tipos de entrada.
  ticketTypes: z.array(ticketTypeSchema).min(1, 'Se requiere al menos un tipo de entrada.'),
});

// --- FUNCIÓN GET (Sin cambios, se mantiene para la funcionalidad existente) ---
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

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// --- FUNCIÓN POST (Completamente actualizada) ---
export async function POST(request: NextRequest) {
  try {
    const user = await requireOrganizer()
    
    const body = await request.json()
    const validation = createEventSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          // Proporciona detalles específicos del error de validación para facilitar la depuración.
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    // Desestructuramos los datos ya validados, separando los datos del evento y los tipos de entrada.
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
    const totalCapacity = ticketTypes.reduce((sum, tt) => sum + tt.capacity, 0);

    const event = await prisma.event.create({
      data: {
        // Datos principales del evento
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        organizerId: user.id,
        isPublished: false, // Los eventos se crean como borradores por defecto
        capacity: totalCapacity, // Agregar la capacidad total requerida
        
        // Creación anidada: Prisma creará los tipos de entrada y los asociará a este evento.
        ticketTypes: {
          create: ticketTypes.map(tt => ({
            name: tt.name,
            price: tt.price,
            capacity: tt.capacity,
            ticketsGenerated: tt.ticketsGenerated,
            currency: 'CLP', // Moneda por defecto
          })),
        },
      },
      include: {
        category: true,
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        ticketTypes: true, // Devuelve los tipos de entrada creados en la respuesta.
      }
    })

    return NextResponse.json({
      message: 'Evento creado exitosamente',
      event
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