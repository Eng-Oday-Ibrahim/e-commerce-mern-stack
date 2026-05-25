import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { AppError } from '../../../shared/middleware/errorHandler';
import { ReviewAdminStatusSchema, ReviewCreateSchema } from '../validators/review.validator';
import {
  createReview,
  deleteReviewAdmin,
  getReviewAdminById,
  listApprovedForProduct,
  listPendingForAdmin,
  setReviewStatus,
} from '../services/review.service';

export const listApprovedForProductPublic = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const reviews = await listApprovedForProduct(productId);
  res.json({ ok: true, reviews });
});

export const createCustomerReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'customer') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }
  const productId = req.params.productId as string;
  const body = ReviewCreateSchema.parse(req.body);
  const review = await createReview({
    productId,
    customerId: req.auth.subject.id,
    rating: body.rating,
    description: body.description,
  });
  res.status(201).json({ ok: true, review: review.toJSON() });
});

export const listPendingAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await listPendingForAdmin();
  res.json({ ok: true, reviews });
});

export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params.id as string;
  const review = await getReviewAdminById(reviewId);
  res.json({ ok: true, review });
});

export const patchAdminStatus = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params.id as string;
  const body = ReviewAdminStatusSchema.parse(req.body);
  const review = await setReviewStatus(reviewId, body.status);
  res.json({ ok: true, review: review.toJSON() });
});

export const removeAdmin = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params.id as string;
  await deleteReviewAdmin(reviewId);
  res.json({ ok: true });
});
