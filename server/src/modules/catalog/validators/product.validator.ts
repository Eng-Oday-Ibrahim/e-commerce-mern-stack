import { z } from 'zod';
import { LocalizedStringSchema } from '../../../shared/utils/zodLocalizedString';

const slug = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, 'Invalid slug');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const optionValueKey = z.string().min(1).max(80).regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/i, 'Invalid key');

export const ProductCreateSchema = z.object({
  // slug & sku are auto-generated.
  name: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  price: z.number().min(0).max(1_000_000_000),
  categoryIds: z.array(objectId).optional(),
  optionIds: z.array(objectId).optional(),
  options: z
    .array(
      z.object({
        optionId: objectId,
        valueKeys: z.array(optionValueKey).default([]),
      })
    )
    .optional(),
  images: z
    .array(z.string().min(1).max(500))
    .optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();
