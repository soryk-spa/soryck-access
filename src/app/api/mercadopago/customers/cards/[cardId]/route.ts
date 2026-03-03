/**
 * DELETE /api/mercadopago/customers/cards/[cardId]
 *
 * Removes a saved card from the authenticated user's Mercado Pago customer.
 *
 * Response:
 *   { success: true, cardId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { deleteCustomerCard } from '@/lib/mercadopago';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const user = await requireAuth();
    const { cardId } = await params;

    if (!user.mpCustomerId) {
      return NextResponse.json(
        { error: 'El usuario no tiene un perfil de pagos configurado' },
        { status: 404 },
      );
    }

    if (!cardId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tarjeta' },
        { status: 400 },
      );
    }

    await deleteCustomerCard(user.mpCustomerId, cardId);

    return NextResponse.json({ success: true, cardId });
  } catch (error) {
    logger.error('[DELETE /api/mercadopago/customers/cards/[cardId]]', error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: 'Error al eliminar la tarjeta',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    );
  }
}
