import { z } from 'zod';
import { LocalizedStringSchema } from '../../../shared/utils/zodLocalizedString';

const slug = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, 'Invalid slug');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const CategoryCreateSchema = z.object({
  // slug is auto-generated.
  name: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  imageUrl: z.string().trim().max(2000).optional(),
  parentCategoryId: objectId.optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();
