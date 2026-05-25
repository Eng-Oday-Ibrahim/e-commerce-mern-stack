import { z } from 'zod';
import { LocalizedStringSchema } from '../../../shared/utils/zodLocalizedString';

const slug = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, 'Invalid slug');

export const OptionValueSchema = z.object({
  key: z.string().min(1).max(80).regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/i, 'Invalid key').optional(),
  value: z.string().min(1).max(120).optional(),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color').optional(),
});

export const OptionCreateSchema = z.object({
  slug,
  name: LocalizedStringSchema,
  type: z.enum(['text', 'color']).default('text'),
  values: z.array(OptionValueSchema).optional(),
  isActive: z.boolean().optional(),
});

export const OptionUpdateSchema = OptionCreateSchema.partial();
