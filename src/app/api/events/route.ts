import { NextRequest, NextResponse } from 'next/server'
import { requireOrganizer, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es demasiado largo'),
  description: z.string().optional(),
  location: z.string().min(1, 'La ubicación es requerida').max(200, 'La ubicación es demasiado larga'),
  startDate: z.string().refine((date) => {
    const eventDate = new Date(date)
    const now = new Date()
    return eventDate > now
  }, 'La fecha debe ser en el futuro'),
  endDate: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  capacity: z.number().min(1, 'La capacidad debe ser mayor a 0').max(100000, 'Capacidad demasiado alta'),
  price: z.number().min(0, 'El precio no puede ser negativo').max(1000000, 'Precio demasiado alto'),
  isFree: z.boolean().default(false),
  imageUrl: z.string().url().optional().or(z.literal(''))
})

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

    const { 
      title, 
      description, 
      location, 
      startDate, 
      endDate, 
      categoryId, 
      capacity, 
      price, 
      isFree,
      imageUrl 
    } = validation.data

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 400 }
      )
    }

    if (endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (end <= start) {
        return NextResponse.json(
          { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
          { status: 400 }
        )
      }
    }

    const finalPrice = isFree ? 0 : price

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        categoryId,
        capacity,
        price: finalPrice,
        isFree,
        imageUrl: imageUrl || null,
        organizerId: user.id,
        isPublished: false
      },
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
        }
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