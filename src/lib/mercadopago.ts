/**
 * MercadoPago integration helpers
 *
 * Lessons learned:
 *  - MP SDK v3 throws plain objects { status, message, cause[] }, not Error instances.
 *  - NEVER send payer.id (mpCustomerId) on card payments — causes "customer server error"
 *    (MP 500) with TEST tokens. The cardToken is self-contained.
 *  - Customer API is only used for saving/listing cards, not for payments.
 */

import { MercadoPagoConfig, Customer, CustomerCard, Payment, Preference } from 'mercadopago';
import { createHmac, timingSafeEqual } from 'crypto';
import { logger } from './logger';

// ─── Client ───────────────────────────────────────────────────────────────────

export function getMPClient(): MercadoPagoConfig {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN is not configured');
  return new MercadoPagoConfig({ accessToken: token, options: { timeout: 10000 } });
}

// ─── MP error helper ──────────────────────────────────────────────────────────
// MP SDK v3 throws plain objects, not Error instances.

export interface MPErrorInfo {
  status: number | null;
  message: string | null;
  causeCode: string | number | null;
  causeDescription: string | null;
}

export function extractMPError(err: unknown): MPErrorInfo {
  const e = err as Record<string, unknown>;
  const cause = Array.isArray(e?.cause)
    ? (e.cause as { code?: string | number; description?: string }[])
    : [];
  return {
    status: typeof e?.status === 'number' ? e.status : null,
    message: typeof e?.message === 'string' ? e.message : null,
    causeCode: cause[0]?.code ?? null,
    causeDescription: cause[0]?.description ?? null,
  };
}

// ─── Customers ────────────────────────────────────────────────────────────────

/**
 * Returns the MP customer ID for the given email.
 * Searches first; creates only if not found.
 * Handles code 101 (already exists) with a retry-search fallback.
 */
export async function getOrCreateCustomer(email: string): Promise<string> {
  const api = new Customer(getMPClient());

  // Search first to avoid unnecessary creates
  const search = await api.search({ options: { email } });
  const existing = (search.results ?? [])[0];
  if (existing?.id) {
    logger.info(`[MP] Found customer for ${email}: ${existing.id}`);
    return existing.id;
  }

  // Not found — create
  try {
    const created = await api.create({ body: { email } });
    if (!created.id) throw new Error('MP customer create returned no id');
    logger.info(`[MP] Created customer for ${email}: ${created.id}`);
    return created.id;
  } catch (err) {
    const { causeCode } = extractMPError(err);
    // Code 101: created between our search and create (race) — search again
    if (causeCode === 101 || causeCode === '101') {
      const retry = await api.search({ options: { email } });
      const found = (retry.results ?? [])[0];
      if (found?.id) {
        logger.info(`[MP] Customer found on retry for ${email}: ${found.id}`);
        return found.id;
      }
    }
    throw err;
  }
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export async function saveCardToCustomer(customerId: string, cardToken: string) {
  const api = new CustomerCard(getMPClient());
  const card = await api.create({ customerId, body: { token: cardToken } });
  logger.info(`[MP] Card saved for customer ${customerId}: card ${card.id}`);
  return card;
}

export async function listCustomerCards(customerId: string) {
  const api = new CustomerCard(getMPClient());
  return (await api.list({ customerId })) ?? [];
}

export async function deleteCustomerCard(customerId: string, cardId: string) {
  const api = new CustomerCard(getMPClient());
  await api.remove({ customerId, cardId });
  logger.info(`[MP] Card ${cardId} deleted for customer ${customerId}`);
}

// ─── Checkout Pro (web payments) ──────────────────────────────────────────────

export interface MPPreferenceInput {
  orderId: string;
  description: string;
  amount: number;
  email: string;
  appUrl: string;
  returnPath?: string;
}

export async function createPreference(input: MPPreferenceInput): Promise<string> {
  const api = new Preference(getMPClient());
  const returnUrl = `${input.appUrl}${input.returnPath ?? '/api/mercadopago/return'}`;

  const response = await api.create({
    body: {
      items: [{ id: input.orderId, title: input.description, quantity: 1, unit_price: input.amount, currency_id: 'CLP' }],
      payer: { email: input.email },
      external_reference: input.orderId,
      back_urls: { success: returnUrl, failure: returnUrl, pending: returnUrl },
      auto_return: 'approved',
    },
  });

  if (!response.init_point) throw new Error('MP did not return an init_point URL');
  logger.info(`[MP] Preference created: ${response.id} for order ${input.orderId}`);
  return response.init_point;
}

// ─── Card payments ────────────────────────────────────────────────────────────

export interface MPPaymentInput {
  amount: number;
  cardToken: string;
  installments: number;
  paymentMethodId: string;
  email: string;
  description: string;
  externalReference: string;
}

/**
 * Creates a card payment on MercadoPago.
 *
 * IMPORTANT: payer.id (mpCustomerId) is intentionally NOT sent.
 * Sending it with TEST tokens causes "customer server error" (MP 500).
 * The cardToken created from a saved card is self-contained and works without it.
 */
export async function createMPPayment(input: MPPaymentInput) {
  const api = new Payment(getMPClient());

  const response = await api.create({
    body: {
      transaction_amount: Math.round(input.amount), // CLP must be integer
      token: input.cardToken,
      installments: input.installments,
      payment_method_id: input.paymentMethodId,
      description: input.description,
      external_reference: input.externalReference,
      capture: true,
      payer: { email: input.email },
    },
  });

  logger.info(`[MP] Payment: id=${response.id} status=${response.status} method=${input.paymentMethodId}`);
  return response;
}

// ─── Webhook signature verification ──────────────────────────────────────────

export function verifyMPWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn('[MP] MP_WEBHOOK_SECRET not set – skipping signature verification');
    return true;
  }
  try {
    const parts = Object.fromEntries(
      xSignature.split(',').map((p) => p.split('=') as [string, string]),
    );
    const { ts, v1 } = parts;
    if (!ts || !v1) return false;
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expected = createHmac('sha256', secret).update(manifest).digest('hex');
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

// ─── Fetch payment by id (used in webhooks) ───────────────────────────────────

export async function getMPPaymentById(mpPaymentId: string | number) {
  return new Payment(getMPClient()).get({ id: Number(mpPaymentId) });
}
