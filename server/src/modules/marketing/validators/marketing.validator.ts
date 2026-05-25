import { z } from 'zod';
import { LocalizedStringSchema } from '../../../shared/utils/zodLocalizedString';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const AnnouncementCreateSchema = z.object({
  message: LocalizedStringSchema,
  isActive: z.boolean().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  sortOrder: z.number().int().optional(),
});

export const CouponCreateSchema = z.object({
  code: z.string().trim().min(2).max(40),
  type: z.enum(['percent', 'fixed']),
  percentOff: z.number().min(1).max(100).optional(),
  fixedOff: z.number().min(0).optional(),
  minSubtotal: z.number().min(0).optional(),
  maxRedemptions: z.number().int().min(1).nullable().optional(),
  perCustomerMax: z.number().int().min(1).optional(),
  currencyCode: z.string().trim().max(8).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const OfferCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  targetType: z.enum(['product', 'collection', 'category']),
  targetIds: z.array(objectId).min(1).max(500),
  percentOff: z.number().min(1).max(100).optional(),
  fixedOff: z.number().min(0).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const CampaignCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(4000).optional(),
  couponIds: z.array(objectId).optional(),
  offerIds: z.array(objectId).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const CartTrackSchema = z.object({
  sessionKey: z.string().trim().min(8).max(200),
  customerId: objectId.optional(),
  currencyCode: z.string().trim().max(8).optional(),
  items: z
    .array(
      z.object({
        productId: objectId,
        quantity: z.number().int().min(1).max(9999),
        selections: z
          .array(
            z.object({
              optionId: objectId,
              valueKeys: z.array(z.string()).max(50),
            })
          )
          .optional(),
      })
    )
    .max(100),
});
