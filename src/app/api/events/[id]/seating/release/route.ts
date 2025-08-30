import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params
    const { seatIds, sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Build where clause
    const whereClause: {
      sessionId: string
      eventId: string
      seatId?: { in: string[] }
    } = {
      sessionId,
      eventId
    }

    // If specific seat IDs are provided, only release those
    if (Array.isArray(seatIds) && seatIds.length > 0) {
      whereClause.seatId = { in: seatIds }
    }

    // Delete reservations
    const result = await prisma.seatReservation.deleteMany({
      where: whereClause
    })

    return NextResponse.json({
      success: true,
      releasedCount: result.count,
      message: `Released ${result.count} seat reservations`
    })
  } catch (error) {
    console.error('Error releasing seats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
