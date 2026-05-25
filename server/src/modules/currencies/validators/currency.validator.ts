import { z } from 'zod';

export const CurrencyCreateSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(80),
  symbol: z.string().min(0).max(10).optional(),
  decimals: z.number().int().min(0).max(6).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
});

export const CurrencyUpdateSchema = CurrencyCreateSchema.partial();

