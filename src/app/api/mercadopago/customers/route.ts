/**
 * POST /api/mercadopago/customers
 *
 * Saves a tokenised card to the authenticated user's MP customer account.
 * Creates the MP customer if it doesn't exist yet.
 *
 * Body: { cardToken: string }
 * Returns: { mpCustomerId, card: { id, lastFourDigits, expirationMonth, expirationYear, paymentMethodId, ... } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateCustomer, saveCardToCustomer, extractMPError } from '@/lib/mercadopago';
import { RateLimitPresets } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

const bodySchema = z.object({
  cardToken: z.string().min(1, 'Se requiere el token de tarjeta'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const rateCheck = await RateLimitPresets.api.isAllowed(`card-save:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en un momento.' }, { status: 429 });
    }

    const user = await requireAuth();

    const validation = bodySchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: validation.error.issues }, { status: 400 });
    }
    const { cardToken } = validation.data;

    // Get or create MP customer
    let mpCustomerId = user.mpCustomerId ?? null;
    if (!mpCustomerId) {
      mpCustomerId = await getOrCreateCustomer(user.email);
      await prisma.user.update({ where: { id: user.id }, data: { mpCustomerId } });
    }

    // Save card, retry with fresh customer if stale
    let card;
    try {
      card = await saveCardToCustomer(mpCustomerId, cardToken);
    } catch (err) {
      const { status, causeCode, message } = extractMPError(err);
      const isStale =
        status === 404 ||
        status === 401 ||  // credentials mismatch (e.g. after switching TEST → LIVE)
        causeCode === 2002 || causeCode === '2002' ||
        causeCode === 300 || causeCode === '300' || // env mismatch: customer from different credentials set (TEST vs LIVE)
        (typeof message === 'string' && message.toLowerCase().includes('not found'));

      if (isStale) {
        logger.warn(`[customers] Stale mpCustomerId ${mpCustomerId}, recreating`);
        mpCustomerId = await getOrCreateCustomer(user.email);
        await prisma.user.update({ where: { id: user.id }, data: { mpCustomerId } });
        card = await saveCardToCustomer(mpCustomerId, cardToken);
      } else {
        throw err;
      }
    }

    return NextResponse.json({
      mpCustomerId,
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
    const raw = typeof error === 'object' ? JSON.stringify(error) : String(error);
    const { status: mpStatus, message: mpMessage, causeCode, causeDescription } = extractMPError(error);

    console.error('[POST /api/mercadopago/customers]', raw);
    logger.error('[POST /api/mercadopago/customers]', error instanceof Error ? error : undefined, { raw });

    return NextResponse.json(
      {
        error: 'Error al guardar la tarjeta',
        details: mpMessage ?? (error instanceof Error ? error.message : raw),
        code: causeCode,
        description: causeDescription,
        httpStatus: mpStatus,
      },
      { status: 500 },
    );
  }
}
