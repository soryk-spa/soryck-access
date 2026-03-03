/**
 * GET /api/mercadopago/customers/cards
 *
 * Returns the saved cards for the authenticated user.
 *
 * Response:
 *   { cards: Array<{ id, lastFourDigits, expirationMonth, expirationYear,
 *                    paymentMethodId, paymentMethodName, issuerName,
 *                    cardholderName }> }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { listCustomerCards } from '@/lib/mercadopago';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.mpCustomerId) {
      // User has no MP customer yet – no saved cards
      return NextResponse.json({ cards: [] });
    }

    const rawCards = await listCustomerCards(user.mpCustomerId);

    const cards = (Array.isArray(rawCards) ? rawCards : []).map((c: any) => ({
      id: c.id,
      lastFourDigits: c.last_four_digits,
      expirationMonth: c.expiration_month,
      expirationYear: c.expiration_year,
      paymentMethodId: c.payment_method?.id,
      paymentMethodName: c.payment_method?.name,
      issuerName: c.issuer?.name,
      cardholderName: c.cardholder?.name,
    }));

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('[GET /api/mercadopago/customers/cards]', error);
    return NextResponse.json(
      {
        error: 'Error al obtener las tarjetas guardadas',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    );
  }
}
