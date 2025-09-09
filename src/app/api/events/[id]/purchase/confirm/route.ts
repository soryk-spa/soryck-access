import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SeatReservationManager } from '@/lib/seat-reservation-manager'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {
      sessionId,
      buyerInfo,
      seatIds,
      totalAmount,
      selectedSeats
    } = await request.json()

    const { id } = await params

    // Verificar que la reserva aún sea válida
    const reservation = await SeatReservationManager.getSessionReservations(sessionId)
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva expirada o no válida' },
        { status: 400 }
      )
    }

    // Obtener información del evento
    const event = await prisma.event.findUnique({
      where: { id },
      include: { sections: true }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // Verificar disponibilidad de asientos
    const areAvailable = await SeatReservationManager.areSeatsAvailable(seatIds)
    if (!areAvailable) {
      return NextResponse.json(
        { error: 'Uno o más asientos ya no están disponibles' },
        { status: 400 }
      )
    }

    // Crear usuario invitado si no existe
    let guestUser = await prisma.user.findUnique({
      where: { email: buyerInfo.email }
    })

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          clerkId: `guest_${randomUUID()}`,
          email: buyerInfo.email,
          firstName: buyerInfo.firstName,
          lastName: buyerInfo.lastName
        }
      })
    }

    // Crear la orden
    const order = await prisma.order.create({
      data: {
        id: randomUUID(),
        orderNumber: `ORDER-${Date.now()}`,
        eventId: id,
        userId: guestUser.id,
        totalAmount,
        currency: 'CLP',
        quantity: selectedSeats.length,
        status: 'PAID'
      }
    })

    // Crear tickets para cada asiento
    const ticketPromises = selectedSeats.map(async (seat: {
      id: string;
      sectionId: string;
      sectionName: string;
      row: string;
      number: string;
      price: number;
    }) => {
      return prisma.ticket.create({
        data: {
          id: randomUUID(),
          orderId: order.id,
          eventId: id,
          userId: guestUser.id,
          qrCode: `${event.id}-${guestUser.id}-${seat.id}-${Date.now()}`,
          seatId: seat.id,
          status: 'ACTIVE'
        }
      })
    })

    const tickets = await Promise.all(ticketPromises)

    // Marcar asientos como vendidos
    await prisma.eventSeat.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'SOLD' }
    })

    // Liberar la reserva
    await SeatReservationManager.releaseReservation(sessionId)

    return NextResponse.json({
      success: true,
      order,
      tickets,
      message: 'Compra realizada exitosamente'
    })

  } catch (error) {
    console.error('Error confirming purchase:', error)
    return NextResponse.json(
      { error: 'Error al procesar la compra' },
      { status: 500 }
    )
  }
}