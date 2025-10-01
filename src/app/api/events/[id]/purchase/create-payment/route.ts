import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { webpayPlus } from '@/lib/transbank'
import { SeatReservationManager } from '@/lib/seat-reservation-manager'
import { calculatePriceBreakdown } from '@/lib/commission'
import { randomUUID } from 'crypto'
import { z } from 'zod'

const createPaymentSchema = z.object({
  sessionId: z.string().min(1, 'Session ID es requerido'),
  buyerInfo: z.object({
    firstName: z.string().min(1, 'Nombre es requerido'),
    lastName: z.string().min(1, 'Apellido es requerido'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
  }),
  seatIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un asiento'),
  selectedSeats: z.array(z.object({
    id: z.string(),
    sectionId: z.string(),
    sectionName: z.string(),
    row: z.string(),
    number: z.string(),
    price: z.number(),
  })),
})

function generateShortBuyOrder(prefix: string = "SEAT"): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")
  const second = String(now.getSeconds()).padStart(2, "0")
  const ms = String(now.getMilliseconds()).padStart(3, "0").slice(0, 2)
  const random = Math.random().toString(36).substr(2, 2).toUpperCase()
  const buyOrder = `${prefix}${year}${month}${day}${hour}${minute}${second}${ms}${random}`
  return buyOrder.substring(0, 26)
}

function generateShortSessionId(prefix: string = "sess"): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 4)
  const sessionId = `${prefix}-${timestamp}-${random}`
  return sessionId.substring(0, 61)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== INICIO DE CREACIÓN DE PAGO CON ASIENTOS ===')
    
    const body = await request.json()
    const validation = createPaymentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { sessionId, buyerInfo, seatIds, selectedSeats } = validation.data
    const { id: eventId } = await params

    // Verificar que la reserva existe y es válida
    const reservation = await SeatReservationManager.getSessionReservations(sessionId)
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva expirada o no válida' },
        { status: 400 }
      )
    }

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
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

    // Calcular monto total
    const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
    console.log(`[PAYMENT] Total antes de comisión: $${totalAmount}`)

    // Calcular breakdown con comisión
    const priceBreakdown = calculatePriceBreakdown(totalAmount, event.currency)
    const finalTotalAmount = priceBreakdown.totalPrice

    console.log(`[PAYMENT] Resumen de precios:`, {
      baseAmount: totalAmount,
      commission: priceBreakdown.commission,
      finalTotal: finalTotalAmount,
      seatsCount: selectedSeats.length
    })

    // Buscar o crear usuario guest
    let guestUser = await prisma.user.findUnique({
      where: { email: buyerInfo.email }
    })

    if (!guestUser) {
      console.log(`[USER] Creando usuario guest para ${buyerInfo.email}`)
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

    // Crear orden en estado PENDING
    // Guardamos sessionId en paymentIntentId temporalmente para recuperarlo después
    const orderNumber = generateShortBuyOrder("SEAT")
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: finalTotalAmount,
        baseAmount: priceBreakdown.basePrice,
        commissionAmount: priceBreakdown.commission,
        currency: event.currency,
        quantity: selectedSeats.length,
        status: 'PENDING',
        userId: guestUser.id,
        eventId: event.id,
        paymentIntentId: `seating:${sessionId}:${seatIds.join(',')}`, // Metadata temporal
      }
    })

    console.log('Orden creada:', { 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      total: finalTotalAmount,
      sessionId
    })

    // Si es gratis, procesar directamente
    if (finalTotalAmount === 0) {
      console.log('Entrada gratuita, procesando directamente...')
      
      // Crear tickets
      const ticketPromises = selectedSeats.map(async (seat) => {
        return prisma.ticket.create({
          data: {
            id: randomUUID(),
            orderId: order.id,
            eventId: event.id,
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

      // Actualizar orden a PAID
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' }
      })

      // Liberar reserva
      await SeatReservationManager.releaseReservation(sessionId)

      return NextResponse.json({
        success: true,
        isFree: true,
        order,
        tickets,
        message: 'Compra realizada exitosamente'
      })
    }

    // Crear transacción en Transbank
    const transbankSessionId = generateShortSessionId("seat")
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/transbank/return-seating`

    console.log(`[WEBPAY] Creando transacción - Monto: $${finalTotalAmount}`)
    const transbankResponse = await webpayPlus.create(
      order.orderNumber,
      transbankSessionId,
      finalTotalAmount,
      returnUrl
    )

    console.log('[WEBPAY] Transacción creada:', {
      token: transbankResponse.token,
      url: transbankResponse.url
    })

    // Crear registro de pago
    await prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId: transbankSessionId,
        token: transbankResponse.token,
        amount: finalTotalAmount,
        currency: event.currency,
        status: 'PENDING',
      }
    })

    return NextResponse.json({
      success: true,
      paymentUrl: transbankResponse.url,
      transbankToken: transbankResponse.token,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })

  } catch (error) {
    console.error('Error creating seating payment:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    )
  }
}
