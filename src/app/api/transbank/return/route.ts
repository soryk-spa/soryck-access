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
  status: string;
}

async function handleTransactionCommit(token: string | null) {
  if (!token) {
    console.error('No se recibió token en la URL de retorno.');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=no-token`);
  }

  console.log(`Intentando confirmar la transacción con el token: ${token}`);

  try {
    const response = await webpayPlus.commit(token);
    console.log('Respuesta de webpayPlus.commit:', response);

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
    });

    if (!payment) {
      console.error(`Error crítico: No se encontró el pago en la BD para el token: ${token}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=payment-not-found`);
    }

    const isApproved = response.status === 'AUTHORIZED' && response.response_code === 0;

    if (isApproved) {
      await processSuccessfulPayment(payment, response);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${payment.order.id}`);
    } else {
      await processFailedPayment(payment, response);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${payment.order.id}&reason=transaction-failed`);
    }
  } catch (transactionError) {
    console.error('Error al ejecutar webpayPlus.commit:', transactionError);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=confirmation-error`);
  }
  
}

export async function GET(request: NextRequest) {
  console.warn('Se recibió una petición GET en la URL de retorno. Procesando...');
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token_ws');
  
  if (searchParams.get('TBK_TOKEN')) {
      console.log('El usuario canceló la transacción en Webpay.');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?reason=transaction-cancelled`);
  }
  
  return await handleTransactionCommit(token);
}

export async function POST(request: NextRequest) {
  console.log('Se recibió una petición POST en la URL de retorno. Procesando...');
  const formData = await request.formData();
  const token = formData.get('token_ws') as string;
  return await handleTransactionCommit(token);
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