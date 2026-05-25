import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const StockSetOnHandSchema = z.object({
  productId: objectId,
  onHandQty: z.number().int().min(0).max(1_000_000_000),
});

export const StockAdjustSchema = z.object({
  productId: objectId,
  delta: z.number().int().min(-1_000_000_000).max(1_000_000_000),
  reason: z.string().max(200).optional(),
});
