import { NextRequest, NextResponse } from 'next/server'
import { webpayPlus } from '@/lib/transbank'
import { prisma } from '@/lib/prisma'
import { SeatReservationManager } from '@/lib/seat-reservation-manager'
import { randomUUID } from 'crypto'

interface TransbankCommitResponse {
  buy_order: string
  authorization_code: string
  response_code: number
  payment_type_code: string
  transaction_date: string
  status: string
}

async function handleTransactionCommit(token: string | null) {
  if (!token) {
    console.error('[SEATING-RETURN] No se recibió token en la URL de retorno')
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=no-token`
    )
  }

  console.log(`[SEATING-RETURN] Confirmando transacción con token: ${token}`)

  try {
    const response = await webpayPlus.commit(token)
    console.log('[SEATING-RETURN] Respuesta de Transbank:', response)

    // Buscar el pago
    const payment = await prisma.payment.findFirst({
      where: { token },
      include: {
        order: {
          include: {
            event: true,
            user: true,
          },
        },
      },
    })

    if (!payment) {
      console.error(`[SEATING-RETURN] No se encontró el pago para token: ${token}`)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=payment-not-found`
      )
    }

    const isApproved = response.status === 'AUTHORIZED' && response.response_code === 0

    if (isApproved) {
      await processSuccessfulSeatingPayment(payment, response)
      await new Promise((resolve) => setTimeout(resolve, 500))
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${payment.order.id}`
      )
    } else {
      await processFailedSeatingPayment(payment, response)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${payment.order.id}&reason=transaction-failed`
      )
    }
  } catch (error) {
    console.error('[SEATING-RETURN] Error al confirmar transacción:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=confirmation-error`
    )
  }
}

async function processSuccessfulSeatingPayment(
  payment: { id: string; order: { id: string; eventId: string; userId: string; paymentIntentId: string | null } },
  transbankResponse: TransbankCommitResponse
) {
  console.log('[SEATING-RETURN] Procesando pago exitoso de asientos...')

  const { order } = payment

  // Extraer metadata de paymentIntentId
  // Formato: "seating:sessionId:seatId1,seatId2,seatId3"
  if (!order.paymentIntentId || !order.paymentIntentId.startsWith('seating:')) {
    console.error('[SEATING-RETURN] Metadata de asientos no encontrada en paymentIntentId')
    throw new Error('Metadata de asientos no válida')
  }

  const [, sessionId, seatIdsStr] = order.paymentIntentId.split(':')
  const seatIds = seatIdsStr.split(',')

  console.log('[SEATING-RETURN] Metadata recuperada:', { sessionId, seatIds })

  // Verificar que los asientos aún están reservados para esta sesión
  const reservation = await SeatReservationManager.getSessionReservations(sessionId)
  if (!reservation) {
    console.warn('[SEATING-RETURN] Reserva expirada, pero el pago fue exitoso. Continuando...')
  }

  try {
    // Obtener información de asientos
    const seats = await prisma.eventSeat.findMany({
      where: { id: { in: seatIds } },
      include: { section: true },
    })

    if (seats.length !== seatIds.length) {
      console.error('[SEATING-RETURN] No se encontraron todos los asientos')
      throw new Error('Asientos no encontrados')
    }

    // Crear tickets en una transacción
    await prisma.$transaction([
      // Crear tickets
      ...seats.map((seat) =>
        prisma.ticket.create({
          data: {
            id: randomUUID(),
            qrCode: `${order.eventId}-${order.userId}-${seat.id}-${Date.now()}`,
            eventId: order.eventId,
            userId: order.userId,
            orderId: order.id,
            seatId: seat.id,
            status: 'ACTIVE',
          },
        })
      ),
      // Marcar asientos como vendidos
      prisma.eventSeat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'SOLD' },
      }),
      // Actualizar orden a PAID
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentIntentId: transbankResponse.buy_order, // Reemplazar con buy_order real
        },
      }),
      // Actualizar pago
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          authorizationCode: transbankResponse.authorization_code,
          responseCode: transbankResponse.response_code,
          paymentMethod: transbankResponse.payment_type_code,
          transactionDate: new Date(transbankResponse.transaction_date),
        },
      }),
    ])

    console.log('[SEATING-RETURN] Tickets creados y asientos marcados como vendidos')

    // Liberar reserva
    await SeatReservationManager.releaseReservation(sessionId)
    console.log('[SEATING-RETURN] Reserva liberada')

    // TODO: Enviar email con tickets
    // await sendSeatingTicketsEmail(order, seats)
  } catch (error) {
    console.error('[SEATING-RETURN] Error procesando pago exitoso:', error)
    throw error
  }
}

async function processFailedSeatingPayment(
  payment: { id: string; order: { id: string; paymentIntentId: string | null } },
  transbankResponse: TransbankCommitResponse
) {
  console.log('[SEATING-RETURN] Procesando pago fallido de asientos...')

  const { order } = payment

  // Extraer sessionId de metadata
  if (order.paymentIntentId && order.paymentIntentId.startsWith('seating:')) {
    const [, sessionId] = order.paymentIntentId.split(':')
    
    // Liberar reserva ya que el pago falló
    await SeatReservationManager.releaseReservation(sessionId)
    console.log('[SEATING-RETURN] Reserva liberada por pago fallido')
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    }),
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REJECTED',
        responseCode: transbankResponse.response_code,
        paymentMethod: transbankResponse.payment_type_code,
      },
    }),
  ])

  console.log('[SEATING-RETURN] Orden y pago marcados como rechazados')
}

export async function GET(request: NextRequest) {
  console.log('[SEATING-RETURN] GET request recibido')
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token_ws')

  if (searchParams.get('TBK_TOKEN')) {
    console.log('[SEATING-RETURN] Usuario canceló la transacción')
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=transaction-cancelled`
    )
  }

  return await handleTransactionCommit(token)
}

export async function POST(request: NextRequest) {
  console.log('[SEATING-RETURN] POST request recibido')
  const formData = await request.formData()
  const token = formData.get('token_ws') as string
  return await handleTransactionCommit(token)
}
