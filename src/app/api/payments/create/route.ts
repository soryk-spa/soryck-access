// src/app/api/payments/create/route.ts - VERSIÓN ACTUALIZADA CON FUNCIÓN CORREGIDA

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { webpayPlus } from '@/lib/transbank'
import { z } from 'zod'

const createPaymentSchema = z.object({
  eventId: z.string(),
  quantity: z.number().min(1).max(10)
})

// ✅ FUNCIÓN CORREGIDA PARA GENERAR buyOrder VÁLIDO
function generateShortBuyOrder(prefix: string = 'SP'): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)  // 2 dígitos
  const month = String(now.getMonth() + 1).padStart(2, '0')  // 2 dígitos
  const day = String(now.getDate()).padStart(2, '0')  // 2 dígitos
  const hour = String(now.getHours()).padStart(2, '0')  // 2 dígitos
  const minute = String(now.getMinutes()).padStart(2, '0')  // 2 dígitos
  const second = String(now.getSeconds()).padStart(2, '0')  // 2 dígitos
  const ms = String(now.getMilliseconds()).padStart(3, '0').slice(0, 2)  // 2 dígitos
  const random = Math.random().toString(36).substr(2, 2).toUpperCase()  // 2 caracteres
  
  // Formato: PREFIJO + YYMMDDHHMMSSMMRR = máximo 20 caracteres
  const buyOrder = `${prefix}${year}${month}${day}${hour}${minute}${second}${ms}${random}`
  
  // Validar longitud
  if (buyOrder.length > 26) {
    console.warn(`buyOrder demasiado largo: ${buyOrder.length} caracteres. Recortando...`)
    return buyOrder.substring(0, 26)
  }
  
  console.log(`buyOrder generado: ${buyOrder} (${buyOrder.length} caracteres)`)
  return buyOrder
}

// ✅ FUNCIÓN PARA GENERAR sessionId CORTO
function generateShortSessionId(prefix: string = 'sess'): string {
  const timestamp = Date.now().toString(36) // Base 36 es más corto
  const random = Math.random().toString(36).substr(2, 4) // 4 caracteres aleatorios
  
  // Formato: prefijo-timestamp-random
  const sessionId = `${prefix}-${timestamp}-${random}`
  
  // Validar longitud (máximo 61 caracteres)
  if (sessionId.length > 61) {
    console.warn(`sessionId demasiado largo: ${sessionId.length} caracteres. Recortando...`)
    return sessionId.substring(0, 61)
  }
  
  console.log(`sessionId generado: ${sessionId} (${sessionId.length} caracteres)`)
  return sessionId
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO DE CREACIÓN DE PAGO ===')
    
    const user = await requireAuth()
    console.log('Usuario autenticado:', { userId: user.id, email: user.email })
    
    const body = await request.json()
    console.log('Body recibido:', body)
    
    const validation = createPaymentSchema.safeParse(body)
    if (!validation.success) {
      console.error('Validación fallida:', validation.error)
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { eventId, quantity } = validation.data

    // Obtener evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    })

    if (!event || !event.isPublished) {
      console.error('Evento no encontrado o no publicado:', { eventId, event })
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    console.log('Evento encontrado:', {
      id: event.id,
      title: event.title,
      price: event.price,
      capacity: event.capacity,
      ticketsSold: event._count.tickets,
      isFree: event.isFree
    })

    // Verificar disponibilidad
    const availableTickets = event.capacity - event._count.tickets
    if (quantity > availableTickets) {
      console.error('No hay suficientes tickets:', { quantity, availableTickets })
      return NextResponse.json(
        { error: 'No hay suficientes tickets disponibles' },
        { status: 400 }
      )
    }

    const totalAmount = event.price * quantity
    console.log('Cantidad total calculada:', { 
      price: event.price, 
      quantity, 
      totalAmount,
      isFree: event.isFree 
    })

    // ✅ USAR FUNCIÓN CORREGIDA PARA GENERAR buyOrder
    const orderNumber = generateShortBuyOrder('SP')
    console.log('Número de orden generado:', orderNumber, 'Longitud:', orderNumber.length)
    
    // Crear orden en la base de datos
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

    console.log('Orden creada en BD:', {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status
    })

    // Si es gratis, manejar directamente
    if (event.isFree || totalAmount === 0) {
      console.log('Evento gratuito, procesando tickets directamente')
      return handleFreeTickets(order, event, user)
    }

    // ✅ USAR FUNCIÓN CORREGIDA PARA GENERAR sessionId
    const sessionId = generateShortSessionId('sess')
    const buyOrder = order.orderNumber
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/transbank/return`

    console.log('Parámetros para Transbank:', {
      buyOrder: buyOrder,
      buyOrderLength: buyOrder.length,
      sessionId: sessionId,
      sessionIdLength: sessionId.length,
      totalAmount: totalAmount,
      returnUrl: returnUrl
    })

    // Validaciones adicionales para Transbank
    if (!buyOrder || buyOrder.length > 26) {
      console.error('buyOrder inválido:', { buyOrder, length: buyOrder?.length })
      return NextResponse.json(
        { error: 'Número de orden inválido' },
        { status: 400 }
      )
    }

    if (!sessionId || sessionId.length > 61) {
      console.error('sessionId inválido:', { sessionId, length: sessionId?.length })
      return NextResponse.json(
        { error: 'ID de sesión inválido' },
        { status: 400 }
      )
    }

    if (totalAmount <= 0 || totalAmount > 999999999) {
      console.error('Monto inválido:', totalAmount)
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      )
    }

    console.log('=== LLAMANDO A TRANSBANK ===')
    
    // Crear transacción en Transbank
    let transbankResponse
    try {
      transbankResponse = await webpayPlus.create(
        buyOrder,
        sessionId,
        totalAmount,
        returnUrl
      )
      
      console.log('Respuesta de Transbank:', {
        token: transbankResponse.token,
        url: transbankResponse.url,
        responseType: typeof transbankResponse
      })
      
    } catch (transbankError) {
      console.error('Error específico de Transbank:', {
        error: transbankError,
        message: transbankError instanceof Error ? transbankError.message : 'Error desconocido',
        stack: transbankError instanceof Error ? transbankError.stack : undefined
      })
      
      return NextResponse.json(
        { 
          error: 'Error al crear la transacción con Transbank',
          details: transbankError instanceof Error ? transbankError.message : 'Error desconocido'
        },
        { status: 500 }
      )
    }

    // Validar respuesta de Transbank
    if (!transbankResponse.token || !transbankResponse.url) {
      console.error('Respuesta inválida de Transbank:', transbankResponse)
      return NextResponse.json(
        { error: 'Respuesta inválida de Transbank' },
        { status: 500 }
      )
    }

    // Guardar información del pago
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId: sessionId,
        token: transbankResponse.token,
        amount: totalAmount,
        currency: event.currency,
        status: 'PENDING'
      }
    })

    console.log('Pago guardado en BD:', {
      id: payment.id,
      token: payment.token,
      amount: payment.amount,
      status: payment.status
    })

    console.log('=== TRANSACCIÓN CREADA EXITOSAMENTE ===')
    console.log('🎫 TOKEN PARA FORMULARIO TRANSBANK:', transbankResponse.token)
    console.log('🌐 URL de redirección:', transbankResponse.url)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl: transbankResponse.url,
      token: transbankResponse.token,
      // Datos adicionales para debug
      debug: {
        buyOrder,
        sessionId,
        totalAmount,
        returnUrl,
        validations: {
          buyOrderLength: `${buyOrder.length}/26`,
          sessionIdLength: `${sessionId.length}/61`,
          amountValid: totalAmount > 0 && totalAmount <= 999999999
        }
      }
    })

  } catch (error) {
    console.error('=== ERROR GENERAL EN CREACIÓN DE PAGO ===')
    console.error('Error completo:', {
      error,
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
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
  console.log('Procesando tickets gratuitos...')

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

  console.log('Tickets gratuitos creados:', tickets.length)

  return NextResponse.json({
    success: true,
    orderId: order.id,
    isFree: true,
    ticketsGenerated: order.quantity
  })
}