import { NextRequest, NextResponse } from 'next/server'
import { webpayPlus } from '@/lib/transbank'
import { prisma } from '@/lib/prisma'
import { SeatReservationManager } from '@/lib/seat-reservation-manager'
import { generateTicketQR } from '@/lib/qr'
import { sendTicketEmail } from '@/lib/email'
import { logger } from '@/lib/logger'
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
    logger.error('Seating payment return: No token received', undefined, { service: 'seating' })
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=no-token`
    )
  }

  logger.info('Seating payment return: Committing transaction', { token: token.substring(0, 10) + '...', service: 'seating' })

  try {
    const response = await webpayPlus.commit(token)
    logger.debug('Seating payment return: Transbank response received', { 
      status: response.status, 
      responseCode: response.response_code,
      service: 'seating'
    })

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
      logger.error('Seating payment return: Payment not found', undefined, { token: token.substring(0, 10) + '...', service: 'seating' })
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
    logger.error('Seating payment return: Transaction commit failed', error as Error, { service: 'seating' })
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=confirmation-error`
    )
  }
}

async function processSuccessfulSeatingPayment(
  payment: { id: string; order: { id: string; eventId: string; userId: string; paymentIntentId: string | null } },
  transbankResponse: TransbankCommitResponse
) {
  logger.info('Processing successful seating payment', { orderId: payment.order.id, service: 'seating' })

  const { order } = payment

  // Extraer metadata de paymentIntentId
  // Formato: "seating:sessionId:seatId1,seatId2,seatId3"
  if (!order.paymentIntentId || !order.paymentIntentId.startsWith('seating:')) {
    logger.error('Seating metadata not found in paymentIntentId', undefined, { 
      orderId: order.id, 
      paymentIntentId: order.paymentIntentId,
      service: 'seating' 
    })
    throw new Error('Metadata de asientos no válida')
  }

  const [, sessionId, seatIdsStr] = order.paymentIntentId.split(':')
  const seatIds = seatIdsStr.split(',')

  logger.debug('Seating metadata recovered', { sessionId, seatCount: seatIds.length, orderId: order.id, service: 'seating' })

  // Verificar que los asientos aún están reservados para esta sesión
  const reservation = await SeatReservationManager.getSessionReservations(sessionId)
  if (!reservation) {
    logger.warn('Seating reservation expired but payment succeeded', { 
      sessionId, 
      orderId: order.id,
      service: 'seating' 
    })
  }

  try {
    // Obtener información de asientos
    const seats = await prisma.eventSeat.findMany({
      where: { id: { in: seatIds } },
      include: { section: true },
    })

    if (seats.length !== seatIds.length) {
      logger.error('Not all seats found in database', undefined, { 
        expectedCount: seatIds.length, 
        foundCount: seats.length,
        sessionId,
        service: 'seating'
      })
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

    logger.seating.purchaseCompleted(order.id, sessionId, seatIds, { 
      eventId: order.eventId, 
      userId: order.userId 
    })

    // Liberar reserva
    await SeatReservationManager.releaseReservation(sessionId)
    logger.seating.reservationReleased(sessionId, 'payment-success', { orderId: order.id })

    // Enviar email con tickets
    await sendSeatingTicketsEmail(order)
    logger.info('Seating tickets email sent successfully', { 
      orderId: order.id, 
      sessionId,
      service: 'seating' 
    })
  } catch (error) {
    logger.seating.purchaseFailed(sessionId, error as Error, { orderId: order.id })
    throw error
  }
}

async function sendSeatingTicketsEmail(
  order: { id: string; eventId: string; userId: string }
) {
  logger.debug('Preparing seating tickets email', { orderId: order.id, service: 'seating' })

  // Obtener datos del evento y usuario
  const [event, user, tickets] = await Promise.all([
    prisma.event.findUnique({
      where: { id: order.eventId },
    }),
    prisma.user.findUnique({
      where: { id: order.userId },
    }),
    prisma.ticket.findMany({
      where: { orderId: order.id },
      include: {
        seat: {
          include: {
            section: true,
          },
        },
      },
    }),
  ])

  if (!event || !user) {
    logger.error('Event or user not found for seating email', undefined, { 
      orderId: order.id, 
      eventId: order.eventId, 
      userId: order.userId,
      service: 'seating'
    })
    return
  }

  // Generar QR codes e imágenes
  const ticketsWithQR = await Promise.all(
    tickets.map(async (ticket) => {
      const qrCodeImage = await generateTicketQR({
        ticketId: ticket.id,
        eventId: event.id,
        userId: user.id,
        eventTitle: event.title,
        attendeeName: user.firstName || user.email.split('@')[0],
        attendeeEmail: user.email,
        eventDate: event.startDate.toISOString(),
        eventLocation: event.location,
        qrCode: ticket.qrCode,
        timestamp: new Date().toISOString(),
      })
      
      return {
        qrCode: ticket.qrCode,
        qrCodeImage,
        seatInfo: ticket.seat
          ? {
              sectionName: ticket.seat.section.name,
              row: ticket.seat.row,
              number: ticket.seat.number,
              sectionColor: ticket.seat.section.color,
            }
          : undefined,
      }
    })
  )

  // Enviar email
  await sendTicketEmail({
    userEmail: user.email,
    userName: user.firstName || user.email.split('@')[0],
    eventTitle: event.title,
    eventDate: event.startDate.toISOString(),
    eventLocation: event.location,
    orderNumber: order.id,
    tickets: ticketsWithQR,
  })

  logger.info('Seating tickets email sent successfully', { 
    orderId: order.id, 
    recipient: user.email, 
    ticketCount: ticketsWithQR.length,
    service: 'seating'
  })
}

async function processFailedSeatingPayment(
  payment: { id: string; order: { id: string; paymentIntentId: string | null } },
  transbankResponse: TransbankCommitResponse
) {
  logger.warn('Processing failed seating payment', { 
    orderId: payment.order.id, 
    responseCode: transbankResponse.response_code,
    service: 'seating'
  })

  const { order } = payment

  // Extraer sessionId de metadata
  if (order.paymentIntentId && order.paymentIntentId.startsWith('seating:')) {
    const [, sessionId] = order.paymentIntentId.split(':')
    
    // Liberar reserva ya que el pago falló
    await SeatReservationManager.releaseReservation(sessionId)
    logger.seating.reservationReleased(sessionId, 'payment-failed', { orderId: order.id })
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

  logger.warn('Seating order and payment marked as rejected', { 
    orderId: order.id, 
    paymentId: payment.id,
    service: 'seating'
  })
}

export async function GET(request: NextRequest) {
  logger.api.request('GET', '/api/transbank/return-seating')
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token_ws')

  if (searchParams.get('TBK_TOKEN')) {
    logger.warn('User cancelled seating transaction', { service: 'seating' })
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=transaction-cancelled`
    )
  }

  return await handleTransactionCommit(token)
}

export async function POST(request: NextRequest) {
  logger.api.request('POST', '/api/transbank/return-seating')
  const formData = await request.formData()
  const token = formData.get('token_ws') as string
  return await handleTransactionCommit(token)
}
