/**
 * GET /api/debug/mp-check
 *
 * Diagnóstico de la integración con MercadoPago.
 * Solo disponible en development o si se pasa ?secret=soryck-debug-2026
 *
 * Prueba:
 *  1. Si MP_ACCESS_TOKEN está configurado
 *  2. Si el Customer API responde (busca un email de prueba)
 *  3. Muestra los primeros 10 y últimos 4 chars del token (para verificar sin exponer)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMPClient } from '@/lib/mercadopago';
import { Customer } from 'mercadopago';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && secret !== 'soryck-debug-2026') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const token = process.env.MP_ACCESS_TOKEN ?? '';
  const tokenMasked = token
    ? `${token.slice(0, 10)}...${token.slice(-4)} (len=${token.length})`
    : '(not set)';
  const isTest = token.startsWith('TEST-');

  const results: Record<string, unknown> = {
    tokenMasked,
    isTest,
    nodeEnv: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };

  // Test Customer search
  try {
    const client = getMPClient();
    const r = await new Customer(client).search({ options: { email: 'probe@diagnostic.com' } });
    results.customerApi = {
      ok: true,
      resultsCount: r.results?.length ?? 0,
    };
  } catch (err) {
    const e = err as Record<string, unknown>;
    results.customerApi = {
      ok: false,
      status: e?.status,
      cause: e?.cause,
      message: (e?.message as string)?.slice(0, 200),
    };
  }

  // Test Customer create (will likely fail in test mode with real email)
  try {
    const client = getMPClient();
    const r = await new Customer(client).create({ body: { email: `diag+${Date.now()}@sorykpass.com` } });
    results.customerCreate = { ok: true, id: r.id };
  } catch (err) {
    const e = err as Record<string, unknown>;
    results.customerCreate = {
      ok: false,
      status: e?.status,
      cause: e?.cause,
      message: (e?.message as string)?.slice(0, 200),
    };
  }

  return NextResponse.json(results, { status: 200 });
}
