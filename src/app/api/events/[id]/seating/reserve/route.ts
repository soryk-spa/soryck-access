import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params
    const { seatIds, sessionId } = await request.json()

    if (!Array.isArray(seatIds) || !sessionId) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    
    const seats = await prisma.eventSeat.findMany({
      where: {
        id: { in: seatIds },
        section: { eventId },
        status: 'AVAILABLE'
      },
      include: {
        reservations: {
          where: {
            expiresAt: { gt: new Date() }
          }
        }
      }
    })

    
    const unavailableSeats = seats.filter(seat => 
      seat.status !== 'AVAILABLE' || seat.reservations.length > 0
    )

    if (unavailableSeats.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some seats are no longer available',
          unavailableSeats: unavailableSeats.map(s => s.id)
        },
        { status: 409 }
      )
    }

    if (seats.length !== seatIds.length) {
      return NextResponse.json(
        { error: 'Some seats were not found' },
        { status: 404 }
      )
    }

    
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    
    await prisma.$transaction(async (tx) => {
      
      await tx.seatReservation.deleteMany({
        where: {
          sessionId,
          eventId
        }
      })

      
      await tx.seatReservation.createMany({
        data: seatIds.map(seatId => ({
          seatId,
          sessionId,
          eventId,
          expiresAt
        }))
      })
    })

    return NextResponse.json({
      success: true,
      expiresAt: expiresAt.toISOString(),
      message: 'Seats reserved successfully'
    })
  } catch (error) {
    console.error('Error reserving seats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
