import { z } from 'zod';
import { REVIEW_STATUSES } from '../models/review.model';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const ReviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  description: z.string().trim().min(4).max(8000),
});

export const ReviewAdminStatusSchema = z.object({
  status: z.enum(REVIEW_STATUSES),
});

export const ReviewProductIdParamsSchema = z.object({
  productId: objectId,
});
