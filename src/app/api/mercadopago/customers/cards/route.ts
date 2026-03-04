/**
 * GET /api/mercadopago/customers/cards
 *
 * Returns the saved cards for the authenticated user.
 *
 * Response:
 *   { cards: Array<{ id, lastFourDigits, expirationMonth, expirationYear,
 *                    paymentMethodId, paymentMethodName, issuerName,
 *                    cardholderName }> }
 *
 * POST /api/mercadopago/customers/cards
 *
 * Saves a new card for the authenticated user.
 *
 * Body (JSON):
 *   { cardToken: string }
 *
 * Response:
 *   { card: { id, lastFourDigits, expirationMonth, expirationYear,
 *             paymentMethodId, paymentMethodName, issuerName,
 *             cardholderName } }
 */

import { NextRequest, NextResponse } from 'next/server';
import type { CustomerCardResponse } from 'mercadopago/dist/clients/customerCard/commonTypes';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listCustomerCards, saveCardToCustomer, getOrCreateCustomer } from '@/lib/mercadopago';
import { RateLimitPresets } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Manejar preflight CORS explícitamente en el nivel de ruta
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

const bodySchema = z.object({
  cardToken: z.string().min(1, 'Se requiere el token de tarjeta'),
});

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.mpCustomerId) {
      // User has no MP customer yet – no saved cards
      return NextResponse.json({ cards: [] });
    }

    const rawCards = await listCustomerCards(user.mpCustomerId);

    const cards = (Array.isArray(rawCards) ? rawCards : []).map((c: CustomerCardResponse) => ({
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
    logger.error('[GET /api/mercadopago/customers/cards]', error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: 'Error al obtener las tarjetas guardadas',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      'unknown';
    const rateCheck = await RateLimitPresets.api.isAllowed(`card-save:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta en un momento.' },
        { status: 429 },
      );
    }

    const user = await requireAuth();
    const body = await request.json();

    const validation = bodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 },
      );
    }

    const { cardToken } = validation.data;

    // 1. Get or create the MP customer
    let mpCustomerId = user.mpCustomerId ?? null;

    if (!mpCustomerId) {
      mpCustomerId = await getOrCreateCustomer(user.email);
      // Persist the customer ID so we don't create duplicates
      await prisma.user.update({
        where: { id: user.id },
        data: { mpCustomerId },
      });
    }

    // 2. Save the card to the MP customer
    const card = await saveCardToCustomer(mpCustomerId, cardToken);

    return NextResponse.json({
      card: {
        id: card.id,
        lastFourDigits: card.last_four_digits,
        expirationMonth: card.expiration_month,
        expirationYear: card.expiration_year,
        paymentMethodId: card.payment_method?.id,
        paymentMethodName: card.payment_method?.name,
        issuerName: card.issuer?.name,
        cardholderName: card.cardholder?.name,
      },
    });
  } catch (error) {
    logger.error('[POST /api/mercadopago/customers/cards]', error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: 'Error al guardar la tarjeta',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    );
  }
}
