import { NextRequest, NextResponse } from 'next/server'
import { SeatReservationManager } from '@/lib/seat-reservation-manager'


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { seatIds } = await request.json()
    const { id } = await params

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de asientos requeridos' },
        { status: 400 }
      )
    }

    
    await SeatReservationManager.cleanupExpiredReservations()

    
    const sessionId = await SeatReservationManager.createReservation(
      id,
      seatIds
    )

    return NextResponse.json({ 
      sessionId,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })
  } catch (error: unknown) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear la reserva' },
      { status: 400 }
    )
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requerido' },
        { status: 400 }
      )
    }

    await SeatReservationManager.releaseReservation(sessionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error releasing reservation:', error)
    return NextResponse.json(
      { error: 'Error al liberar la reserva' },
      { status: 500 }
    )
  }
}