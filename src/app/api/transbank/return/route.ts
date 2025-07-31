import { NextRequest, NextResponse } from 'next/server'
import { webpayPlus } from '@/lib/transbank'
import { prisma } from '@/lib/prisma'

interface Payment {
  id: string;
  order: {
    id: string;
    quantity: number;
    event: { id: string };
    user: { id: string };
  };
}

interface TransbankResponse {
  buy_order: string;
  authorization_code: string;
  response_code: number;
  payment_type_code: string;
  transaction_date: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get('token_ws') as string

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=no-token`
      )
    }

    try {
      const response = await webpayPlus.commit(token)
      
      const payment = await prisma.payment.findFirst({
        where: { token },
        include: {
          order: {
            include: {
              event: true,
              user: true
            }
          }
        }
      })

      if (!payment) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=payment-not-found`
        )
      }

      const isApproved = response.status === 'AUTHORIZED' && response.response_code === 0

      if (isApproved) {
        await processSuccessfulPayment(payment, response)
        
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${payment.order.id}`
        )
      } else {
        await processFailedPayment(payment, response)
        
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${payment.order.id}&reason=transaction-failed`
        )
      }

    } catch (transactionError) {
      console.error('Error confirming transaction:', transactionError)
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=confirmation-error`
      )
    }

  } catch (error) {
    console.error('Error in Transbank callback:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=server-error`
    )
  }
}

async function processSuccessfulPayment(payment: Payment, transbankResponse: TransbankResponse) {
  const tickets = []
  for (let i = 0; i < payment.order.quantity; i++) {
    const qrCode = `${payment.order.event.id}-${payment.order.user.id}-${Date.now()}-${i}`
    tickets.push({
      qrCode,
      eventId: payment.order.event.id.toString(),
      userId: payment.order.user.id.toString(),
      orderId: payment.order.id.toString()
    })
  }

  await prisma.$transaction([
    prisma.ticket.createMany({ data: tickets }),
    
    prisma.order.update({
      where: { id: payment.order.id.toString() },
      data: { 
        status: 'PAID',
        paymentIntentId: transbankResponse.buy_order
      }
    }),
    
    prisma.payment.update({
      where: { id: payment.id.toString() },
      data: {
        status: 'AUTHORIZED',
        authorizationCode: transbankResponse.authorization_code,
        responseCode: transbankResponse.response_code,
        paymentMethod: transbankResponse.payment_type_code,
        transactionDate: new Date(transbankResponse.transaction_date)
      }
    })
  ])
  // await sendTicketConfirmationEmail(payment.order)
}

async function processFailedPayment(payment: Payment, transbankResponse: TransbankResponse) {
  await prisma.$transaction([
    prisma.order.update({
      where: { id: payment.order.id.toString() },
      data: { status: 'CANCELLED' }
    }),
    
    prisma.payment.update({
      where: { id: payment.id.toString() },
      data: {
        status: 'FAILED',
        responseCode: transbankResponse.response_code,
        transactionDate: new Date()
      }
    })
  ])
}