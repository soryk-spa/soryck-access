import { NextRequest, NextResponse } from 'next/server';
import { webpayPlus } from '@/lib/transbank';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { orderId, amount } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Faltan orderId o amount' }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { order: { id: orderId }, status: 'AUTHORIZED' },
    });

    if (!payment || !payment.token) {
      return NextResponse.json({ error: 'Pago no encontrado o no autorizado' }, { status: 404 });
    }

    const token = payment.token;

    const refundResponse = await webpayPlus.refund(token, amount);

    return NextResponse.json({ success: true, data: refundResponse });

  } catch (error) {
    console.error('Error al anular el pago:', error);
    return NextResponse.json(
        { error: 'Error interno del servidor', details: error instanceof Error ? error.message : '' },
        { status: 500 }
    );
  }
}