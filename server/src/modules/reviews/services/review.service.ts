import { Types } from 'mongoose';
import { AppError } from '../../../shared/middleware/errorHandler';
import { sanitizeLeanArray } from '../../../shared/utils/sanitizeLean';
import { ProductModel } from '../../catalog/models/product.model';
import { ReviewModel, type ReviewStatus } from '../models/review.model';

export async function createReview(input: {
  productId: string;
  customerId: string;
  rating: number;
  description: string;
}) {
  if (!Types.ObjectId.isValid(input.productId)) {
    throw new AppError('Invalid product id', 400, 'validation_error');
  }
  if (!Types.ObjectId.isValid(input.customerId)) {
    throw new AppError('Invalid customer id', 400, 'validation_error');
  }
  const productId = new Types.ObjectId(input.productId);
  const customerId = new Types.ObjectId(input.customerId);

  const product = await ProductModel.findOne({ _id: productId, isActive: true }).select({ _id: 1 }).lean();
  if (!product) throw new AppError('Product not found', 404, 'not_found');

  const pending = await ReviewModel.findOne({
    productId,
    customerId,
    status: 'pending',
  })
    .select({ _id: 1 })
    .lean();
  if (pending) {
    throw new AppError('You already have a review awaiting moderation for this product', 409, 'conflict');
  }

  const doc = await ReviewModel.create({
    productId,
    customerId,
    rating: input.rating,
    description: input.description.trim(),
    status: 'pending',
  });

  return doc;
}

export async function listApprovedForProduct(productIdRaw: string) {
  if (!Types.ObjectId.isValid(productIdRaw)) {
    throw new AppError('Invalid product id', 400, 'validation_error');
  }
  const productId = new Types.ObjectId(productIdRaw);
  const product = await ProductModel.findOne({ _id: productId, isActive: true }).select({ _id: 1 }).lean();
  if (!product) throw new AppError('Product not found', 404, 'not_found');

  const rows = await ReviewModel.find({ productId, status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return sanitizeLeanArray(rows as any);
}

export async function listPendingForAdmin() {
  const rows = await ReviewModel.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .populate('productId', { slug: 1, name: 1 })
    .populate('customerId', { email: 1, name: 1 })
    .limit(500)
    .lean();

  return rows.map((r: any) => {
    const prod = r.productId && typeof r.productId === 'object' ? r.productId : null;
    const cust = r.customerId && typeof r.customerId === 'object' ? r.customerId : null;
    return {
      id: r._id.toString(),
      productId: prod?._id?.toString?.() ?? String(r.productId),
      customerId: cust?._id?.toString?.() ?? String(r.customerId),
      rating: r.rating,
      description: r.description,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      product: prod
        ? {
            id: prod._id.toString(),
            slug: prod.slug,
            name: prod.name,
          }
        : undefined,
      customer: cust
        ? {
            id: cust._id.toString(),
            email: cust.email,
            name: cust.name,
          }
        : undefined,
    };
  });
}

export async function getReviewAdminById(reviewId: string) {
  const r: any = await ReviewModel.findById(reviewId)
    .populate('productId', { slug: 1, name: 1 })
    .populate('customerId', { email: 1, name: 1 })
    .lean();

  if (!r) throw new AppError('Review not found', 404, 'not_found');

  const prod = r.productId && typeof r.productId === 'object' ? r.productId : null;
  const cust = r.customerId && typeof r.customerId === 'object' ? r.customerId : null;

  return {
    id: r._id.toString(),
    productId: prod?._id?.toString?.() ?? String(r.productId),
    customerId: cust?._id?.toString?.() ?? String(r.customerId),
    rating: r.rating,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    product: prod
      ? {
          id: prod._id.toString(),
          slug: prod.slug,
          name: prod.name,
        }
      : undefined,
    customer: cust
      ? {
          id: cust._id.toString(),
          email: cust.email,
          name: cust.name,
        }
      : undefined,
  };
}

export async function setReviewStatus(reviewId: string, status: ReviewStatus) {
  const review = await ReviewModel.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404, 'not_found');
  review.status = status;
  await review.save();
  return review;
}

export async function deleteReviewAdmin(reviewId: string) {
  const review = await ReviewModel.findByIdAndDelete(reviewId);
  if (!review) throw new AppError('Review not found', 404, 'not_found');
}
