import Stripe from 'stripe';
import { Types } from 'mongoose';
import { createHash, timingSafeEqual } from 'crypto';
import { AppError } from '../../../shared/middleware/errorHandler';
import { OrderModel } from '../../orders/models/order.model';
import { updateOrderPaymentStatus } from '../../orders/services/order.service';
import { PaymentModel, type PaymentStatus } from '../models/payment.model';

function decToNum(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = v?.toString?.();
  const n = typeof s === 'string' ? Number(s) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function toMinor(amountMajor: number): number {
  const major = round2(amountMajor);
  return Math.round(major * 100);
}

function getEnv(name: string): string {
  return (process.env[name] || '').trim();
}

function hashAccessToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function verifyOrderAccessToken(order: any, token: string): boolean {
  const hash = order?.publicAccessTokenHash;
  if (!hash || !token) return false;
  const a = Buffer.from(String(hash), 'hex');
  const b = Buffer.from(hashAccessToken(token), 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function getStripeClient() {
  const key = getEnv('STRIPE_SECRET_KEY');
  if (!key) throw new AppError('Stripe secret key is not configured', 400, 'validation_error');
  return { stripe: new Stripe(key), webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET') };
}

export async function listAdminPayments() {
  const payments = await PaymentModel.find({}).sort({ createdAt: -1 }).lean();
  return payments;
}

export async function listCustomerPayments(customerId: string) {
  const payments = await PaymentModel.find({ customerId: new Types.ObjectId(customerId) }).sort({ createdAt: -1 }).lean();
  return payments;
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus) {
  const payment = await PaymentModel.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404, 'not_found');
  payment.status = status;
  if (status === 'paid') payment.paidAt = new Date();
  if (status === 'failed') payment.failedAt = new Date();
  if (status === 'refunded' || status === 'partially_refunded') payment.refundedAt = new Date();
  await payment.save();
  await updateOrderPaymentStatus(payment.orderId.toString(), status);
  return payment;
}

export async function createStripeCheckoutSession(input: {
  orderId: string;
  customerId?: string;
  accessToken?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const order = await OrderModel.findById(input.orderId).select('+publicAccessTokenHash');
  if (!order) throw new AppError('Order not found', 404, 'not_found');

  if (input.customerId) {
    if (order.customerId.toString() !== input.customerId) throw new AppError('Order not found', 404, 'not_found');
  } else {
    if (!input.accessToken || !verifyOrderAccessToken(order, input.accessToken)) {
      throw new AppError('Unauthorized', 401, 'unauthorized');
    }
  }
  if (order.status === 'canceled' || order.status === 'refunded') {
    throw new AppError('Cannot pay a closed order', 409, 'conflict');
  }

  // If a webhook was missed, resync from DB before allowing another checkout session.
  const existingPaid = await PaymentModel.findOne({ orderId: order._id, status: 'paid' }).sort({ createdAt: -1 });
  if (existingPaid && order.paymentStatus !== 'paid') {
    await updateOrderPaymentStatus(order._id.toString(), 'paid');
    throw new AppError('Order is already paid', 409, 'conflict');
  }

  if (order.paymentStatus === 'paid') {
    throw new AppError('Order is already paid', 409, 'conflict');
  }

  const total = round2(decToNum(order.total));
  if (total <= 0) throw new AppError('Invalid order total', 400, 'validation_error');

  const { stripe } = await getStripeClient();

  // Idempotency: reuse latest pending Stripe session payment for this order.
  const existingPending = await PaymentModel.findOne({
    orderId: order._id,
    status: 'pending',
    provider: 'stripe',
    providerSessionId: { $exists: true, $ne: null },
  }).sort({ createdAt: -1 });
  if (existingPending?.providerSessionId) {
    try {
      const existingSession = await stripe.checkout.sessions.retrieve(existingPending.providerSessionId);
      if ((existingSession as any)?.status === 'complete' || (existingSession as any)?.payment_status === 'paid') {
        existingPending.status = 'paid';
        existingPending.paidAt = new Date();
        if (typeof (existingSession as any).payment_intent === 'string') {
          existingPending.providerPaymentIntentId = (existingSession as any).payment_intent;
        }
        await existingPending.save();
        await updateOrderPaymentStatus(order._id.toString(), 'paid');
        throw new AppError('Order is already paid', 409, 'conflict');
      }
      if (existingSession?.url && (existingSession as any)?.status === 'open') {
        return { sessionId: existingSession.id, url: existingSession.url };
      }
    } catch {
      // Continue and create a new one if retrieval fails/expired.
    }
  }

  const currencyCode = (order as any).currencyCode || 'USD';
  const sessionMetadata: Record<string, string> = { orderId: order._id.toString() };
  if (input.customerId) sessionMetadata.customerId = input.customerId;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: {
      ...sessionMetadata,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currencyCode,
          unit_amount: toMinor(total),
          product_data: {
            name: `Order #${order.orderNumber}`,
            description: `Payment for order #${order.orderNumber}`,
          },
        },
      },
    ],
    payment_intent_data: {
      metadata: {
        ...sessionMetadata,
      },
    },
  });

  await PaymentModel.findOneAndUpdate(
    { providerSessionId: session.id },
    {
      orderId: order._id,
      customerId: order.customerId,
      provider: 'stripe',
      providerSessionId: session.id,
      providerPaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
      status: 'pending',
      currencyCode,
      amount: total,
      refundedAmount: 0,
      meta: {
        orderNumber: order.orderNumber,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function handleStripeEventFromRawBody(rawBody: Buffer, signature?: string) {
  const { stripe, webhookSecret } = await getStripeClient();
  let event: any;

  const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';

  if (webhookSecret && signature) {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } else {
    if (isProd) {
      if (!webhookSecret) throw new AppError('Stripe webhook secret is not configured', 400, 'validation_error');
      throw new AppError('Missing Stripe signature header', 400, 'validation_error');
    }

    // Dev fallback: allow unsigned events so local development can proceed without configuring Stripe CLI secret.
    event = JSON.parse(rawBody.toString('utf8')) as any;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const payment = await PaymentModel.findOne({ providerSessionId: session.id });
    if (payment) {
      if (payment.status === 'paid') return { received: true };
      payment.status = 'paid';
      payment.paidAt = new Date();
      if (typeof session.payment_intent === 'string') payment.providerPaymentIntentId = session.payment_intent;
      await payment.save();
      await updateOrderPaymentStatus(payment.orderId.toString(), 'paid');
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as any;
    const payment = await PaymentModel.findOne({ providerPaymentIntentId: pi.id });
    if (payment) {
      if (payment.status === 'paid') return { received: true };
      payment.status = 'paid';
      payment.paidAt = new Date();
      await payment.save();
      await updateOrderPaymentStatus(payment.orderId.toString(), 'paid');
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as any;
    const payment = await PaymentModel.findOne({ providerPaymentIntentId: pi.id });
    if (payment) {
      if (payment.status === 'failed') return { received: true };
      payment.status = 'failed';
      payment.failedAt = new Date();
      await payment.save();
      await updateOrderPaymentStatus(payment.orderId.toString(), 'failed');
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as any;
    const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : undefined;
    if (paymentIntentId) {
      const payment = await PaymentModel.findOne({ providerPaymentIntentId: paymentIntentId });
      if (payment) {
        const refundedAmount = round2((charge.amount_refunded || 0) / 100);
        const prevRefunded = round2(decToNum(payment.refundedAmount));
        payment.refundedAmount = Math.max(prevRefunded, refundedAmount) as any;
        const fullAmount = round2(decToNum(payment.amount));
        const nextRefunded = round2(decToNum(payment.refundedAmount));
        payment.status = nextRefunded > 0 && nextRefunded < fullAmount ? 'partially_refunded' : 'refunded';
        payment.refundedAt = new Date();
        await payment.save();
        await updateOrderPaymentStatus(payment.orderId.toString(), payment.status);
      }
    }
  }

  return { received: true };
}
