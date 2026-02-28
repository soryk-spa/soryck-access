import { NextRequest, NextResponse } from 'next/server'
import { requireOrganizer } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await requireOrganizer()

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const skip = (page - 1) * limit

    // Build the where clause for tickets belonging to this organizer's events
    const ticketWhere: Record<string, unknown> = {
      event: {
        organizerId: user.id,
      },
      order: {
        status: 'COMPLETED',
      },
    }

    if (eventId) {
      ticketWhere.eventId = eventId
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where: ticketWhere,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
          ticketType: {
            select: {
              id: true,
              name: true,
              price: true,
              currency: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              currency: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.ticket.count({ where: ticketWhere }),
    ])

    // Get organizer events for the filter dropdown
    const organizerEvents = await prisma.event.findMany({
      where: { organizerId: user.id },
      select: { id: true, title: true, startDate: true },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json({
      tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      events: organizerEvents,
    })
  } catch (error) {
    console.error('[GET /api/organizer/buyers] Error:', error)
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    const status = message.includes('autenticado') || message.includes('Acceso denegado') ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
