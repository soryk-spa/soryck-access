import { NextRequest, NextResponse } from 'next/server'
import { canAccessEvent, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateEventSchema = z.object({
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

    return NextResponse.json({ event })
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

    const ticketsSold = await prisma.ticket.count({
      where: { eventId: id }
    })

    if (capacity < ticketsSold) {
      return NextResponse.json(
        { error: `No puedes reducir la capacidad por debajo de ${ticketsSold} (tickets ya vendidos)` },
        { status: 400 }
      )
    }

    const finalPrice = isFree ? 0 : price

    const updatedEvent = await prisma.event.update({
      where: { id },
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
        imageUrl: imageUrl || null
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