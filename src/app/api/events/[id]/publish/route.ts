import { NextRequest, NextResponse } from 'next/server'
import { canAccessEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CacheInvalidation } from '@/lib/cache-invalidation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { canAccess } = await canAccessEvent(id)
    
    if (!canAccess) {
      return NextResponse.json(
        { error: 'No tienes permisos para publicar/despublicar este evento' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isPublished } = body

    if (typeof isPublished !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublished debe ser un valor booleano' },
        { status: 400 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    if (isPublished && !event.isPublished) {
      if (!event.title || !event.location || !event.startDate || !event.categoryId) {
        return NextResponse.json(
          { error: 'El evento debe tener título, ubicación, fecha y categoría para ser publicado' },
          { status: 400 }
        )
      }

      if (event.startDate <= new Date()) {
        return NextResponse.json(
          { error: 'No se puede publicar un evento con fecha pasada' },
          { status: 400 }
        )
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { isPublished },
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

    
    await CacheInvalidation.invalidateEventsCache();

    return NextResponse.json({
      message: isPublished ? 'Evento publicado exitosamente' : 'Evento despublicado exitosamente',
      event: updatedEvent
    })

  } catch (error) {
    console.error('Error publishing/unpublishing event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}