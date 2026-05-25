import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { AppError } from '../../../shared/middleware/errorHandler';
import {
  createStripeCheckoutSession,
  handleStripeEventFromRawBody,
  listAdminPayments,
  listCustomerPayments,
  updatePaymentStatus,
} from '../services/payment.service';
import { CreateCheckoutSessionSchema, PaymentSettingsPatchSchema, PaymentStatusUpdateSchema } from '../validators/payment.validator';
import { getDefaultActiveCurrency } from '../../currencies/services/currency.service';

export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const body = CreateCheckoutSessionSchema.parse(req.body);
  const origin = req.headers.origin || process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:3000';
  const accessToken = body.accessToken?.trim() || undefined;
  const isAuthedCustomer = req.auth?.subject.type === 'customer';
  if (!isAuthedCustomer && !accessToken) {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }

  const success = new URL(`${origin}/checkout/success`);
  success.searchParams.set('orderId', body.orderId);
  if (accessToken) success.searchParams.set('accessToken', accessToken);

  const cancel = new URL(`${origin}/checkout`);
  cancel.searchParams.set('orderId', body.orderId);
  if (accessToken) cancel.searchParams.set('accessToken', accessToken);

  const out = await createStripeCheckoutSession({
    orderId: body.orderId,
    customerId: isAuthedCustomer ? req.auth!.subject.id : undefined,
    accessToken,
    successUrl: success.toString(),
    cancelUrl: cancel.toString(),
  });
  res.status(201).json({ ok: true, ...out });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const signature = Array.isArray(sig) ? sig[0] : sig;
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
  const result = await handleStripeEventFromRawBody(raw, signature);
  res.json({ ok: true, ...result });
});

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const payments = await listAdminPayments();
  res.json({ ok: true, payments });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'customer') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }
  const payments = await listCustomerPayments(req.auth.subject.id);
  res.json({ ok: true, payments });
});

export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  const body = PaymentStatusUpdateSchema.parse(req.body);
  const payment = await updatePaymentStatus(req.params.id as string, body.status);
  res.json({ ok: true, payment: (payment as any).toJSON() });
});

function getEnv(name: string): string {
  return (process.env[name] || '').trim();
}

async function buildEnvPaymentSettings() {
  const currency = await getDefaultActiveCurrency();
  const currencyCode = (currency as any)?.code || getEnv('CURRENCY_CODE') || 'USD';

  return {
    id: 'env',
    provider: 'stripe',
    stripePublishableKey: getEnv('STRIPE_PUBLISHABLE_KEY') || getEnv('stripePublishableKey') || '',
    stripeSecretKey: getEnv('STRIPE_SECRET_KEY') || '',
    stripeWebhookSecret: getEnv('STRIPE_WEBHOOK_SECRET') || '',
    taxMode: (getEnv('TAX_MODE') as 'exclusive' | 'inclusive') || 'exclusive',
    taxRate: Number(getEnv('TAX_RATE') || 0) || 0,
    taxLabel: getEnv('TAX_LABEL') || 'Tax',
    currencyCode,
  } as const;
}

export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await buildEnvPaymentSettings();
  res.json({
    ok: true,
    settings: {
      id: settings.id,
      provider: settings.provider,
      stripePublishableKey: settings.stripePublishableKey,
      taxMode: settings.taxMode,
      taxRate: settings.taxRate,
      taxLabel: settings.taxLabel,
      currencyCode: settings.currencyCode,
    },
  });
});

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'user') {
    throw new AppError('Forbidden', 403, 'forbidden');
  }
  const settings = await buildEnvPaymentSettings();
  res.json({ ok: true, settings });
});

export const patchSettings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'user') {
    throw new AppError('Forbidden', 403, 'forbidden');
  }

  // Accept the payload for UI compatibility, but settings are sourced from environment variables.
  PaymentSettingsPatchSchema.parse(req.body);

  const settings = await buildEnvPaymentSettings();
  res.json({ ok: true, settings });
});
