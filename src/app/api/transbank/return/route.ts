// src/app/api/transbank/return/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { webpayPlus } from '@/lib/transbank'
import { prisma } from '@/lib/prisma'
import { generateUniqueQRCode } from '@/lib/qr'
import { sendTicketEmail } from '@/lib/email'
import { Payment, Order, User, Event as PrismaEvent, Ticket } from '@prisma/client'

// Tipos para mayor claridad
type FullPayment = Payment & {
  order: Order & {
    user: User,
    event: PrismaEvent
  }
}

type OrderWithTickets = Order & {
  tickets: Ticket[]
}

interface TransbankCommitResponse {
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
      await processSuccessfulPayment(payment as FullPayment, response);
      // Damos un pequeño respiro para que la BD procese todo antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${payment.order.id}`);
    } else {
      await processFailedPayment(payment as FullPayment, response);
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

async function processSuccessfulPayment(payment: FullPayment, transbankResponse: TransbankCommitResponse) {
  console.log('Procesando pago exitoso, generando tickets...');
  
  const timestamp = Date.now();
  const ticketsData = Array.from({ length: payment.order.quantity }).map((_, i) => {
    const qrCode = generateUniqueQRCode(
      payment.order.event.id, 
      payment.order.user.id, 
      timestamp, 
      i
    );
    return {
      qrCode,
      eventId: payment.order.event.id,
      userId: payment.order.user.id,
      orderId: payment.order.id
    };
  });

  try {
    const transactionResult = await prisma.$transaction([
      prisma.ticket.createMany({ data: ticketsData }),
      prisma.order.update({
        where: { id: payment.order.id },
        data: { 
          status: 'PAID',
          paymentIntentId: transbankResponse.buy_order
        },
        include: { tickets: true } // Importante para obtener los IDs de los tickets
      }),
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'AUTHORIZED',
          authorizationCode: transbankResponse.authorization_code,
          responseCode: transbankResponse.response_code,
          paymentMethod: transbankResponse.payment_type_code,
          transactionDate: new Date(transbankResponse.transaction_date)
        }
      })
    ]);
    
    console.log('Tickets creados exitosamente:', ticketsData.length);
    
    const updatedOrder = transactionResult[1] as OrderWithTickets;

    // Usamos los datos correctos y completos que ya tenemos
    await sendTicketEmail({
        user: payment.order.user,
        event: payment.order.event,
        order: updatedOrder
    });
    
  } catch (error) {
    console.error('Error al crear tickets y enviar correo:', error);
    // No relanzamos el error para no afectar la redirección del usuario
  }
}

async function processFailedPayment(payment: FullPayment, transbankResponse: TransbankCommitResponse) {
  console.log('Procesando pago fallido...');
  
  await prisma.$transaction([
    prisma.order.update({
      where: { id: payment.order.id },
      data: { status: 'CANCELLED' }
    }),
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        responseCode: transbankResponse.response_code,
        transactionDate: new Date()
      }
    })
  ]);
}