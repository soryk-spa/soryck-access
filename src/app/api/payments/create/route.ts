import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { webpayPlus } from '@/lib/transbank'
import { z } from 'zod'

const createPaymentSchema = z.object({
  eventId: z.string(),
  quantity: z.number().min(1).max(10)
})

function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  const random = Math.random().toString(36).substr(2, 4)
  
  return `SP${year}${month}${day}${hour}${minute}${second}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    const validation = createPaymentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { eventId, quantity } = validation.data

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    })

    if (!event || !event.isPublished) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    const availableTickets = event.capacity - event._count.tickets
    if (quantity > availableTickets) {
      return NextResponse.json(
        { error: 'No hay suficientes tickets disponibles' },
        { status: 400 }
      )
    }

    const totalAmount = event.price * quantity

    const orderNumber = generateOrderNumber()
    
    console.log('Generated orderNumber:', orderNumber, 'Length:', orderNumber.length)
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        currency: event.currency,
        quantity,
        status: 'PENDING',
        userId: user.id,
        eventId: event.id
      }
    })

    if (event.isFree || totalAmount === 0) {
      return handleFreeTickets(order, event, user)
    }

    const sessionId = `${order.id.substring(0, 10)}-${Date.now().toString(36)}`
    const buyOrder = order.orderNumber
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/transbank/return`

    console.log('Transbank params:', {
      buyOrder: buyOrder,
      buyOrderLength: buyOrder.length,
      sessionId: sessionId,
      totalAmount: totalAmount,
      returnUrl: returnUrl
    })

    const response = await webpayPlus.create(
      buyOrder,
      sessionId,
      totalAmount,
      returnUrl
    )

    await prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId: sessionId,
        token: response.token,
        amount: totalAmount,
        currency: event.currency,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl: response.url,
      token: response.token
    })

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function handleFreeTickets(
  order: {
    id: string
    quantity: number
  },
  event: {
    id: string
  },
  user: {
    id: string
  }
) {

  const tickets = []
  for (let i = 0; i < order.quantity; i++) {
    const qrCode = `${event.id}-${user.id}-${Date.now()}-${i}`
    tickets.push({
      qrCode,
      eventId: event.id,
      userId: user.id,
      orderId: order.id
    })
  }

  await prisma.$transaction([
    prisma.ticket.createMany({ data: tickets }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' }
    })
  ])

  return NextResponse.json({
    success: true,
    orderId: order.id,
    isFree: true,
    ticketsGenerated: order.quantity
  })
}