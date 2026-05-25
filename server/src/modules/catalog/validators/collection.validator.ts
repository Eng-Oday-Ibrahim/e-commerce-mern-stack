import { z } from 'zod';
import { LocalizedStringSchema } from '../../../shared/utils/zodLocalizedString';

const slug = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, 'Invalid slug');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const CollectionCreateSchema = z.object({
  // slug is auto-generated.
  name: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  productIds: z.array(objectId).optional(),
  imageUrl: z.string().min(1).max(500).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

export const CollectionUpdateSchema = CollectionCreateSchema.partial();
