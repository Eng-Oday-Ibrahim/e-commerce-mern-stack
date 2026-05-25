import { z } from 'zod';
import { PAYMENT_STATUSES } from '../models/payment.model';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const CreateCheckoutSessionSchema = z.object({
  orderId: objectId,
  accessToken: z.string().trim().min(20).max(200).optional(),
});

export const PaymentStatusUpdateSchema = z.object({
  status: z.enum(PAYMENT_STATUSES),
});

export const PaymentSettingsPatchSchema = z
  .object({
    provider: z.string().trim().optional(),
    stripePublishableKey: z.string().trim().optional(),
    stripeSecretKey: z.string().trim().optional(),
    stripeWebhookSecret: z.string().trim().optional(),
    taxMode: z.enum(['exclusive', 'inclusive']).optional(),
    taxRate: z.number().min(0).optional(),
    taxLabel: z.string().trim().min(1).optional(),
    currencyCode: z.string().trim().min(3).max(8).optional(),
  })
  .partial();
