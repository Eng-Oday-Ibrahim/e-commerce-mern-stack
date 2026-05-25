import { Types } from 'mongoose';
import { CACHE_KEYS } from '../../../infrastructure/cache/cache.keys';
import { cacheService } from '../../../infrastructure/cache/cache.service';
import { publishCategoryCreated, publishCategoryUpdated } from '../../../infrastructure/messaging/publisher';
import { AppError } from '../../../shared/middleware/errorHandler';
import { sanitizeLeanArray, sanitizeLeanDoc } from '../../../shared/utils/sanitizeLean';
import { randomCode, slugify } from '../../../shared/utils/slug';
import { CategoryModel } from '../models/category.model';
import { ProductModel } from '../models/product.model';
import { OfferModel } from '../../marketing/models/offer.model';

const PUBLIC_LIST_TTL_SECONDS = 60;
const BY_ID_TTL_SECONDS = 5 * 60;
const ADMIN_LIST_TTL_SECONDS = 30;

export async function listPublicCategories() {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.CATALOG.CATEGORIES_PUBLIC);
  if (cached) return cached;

  const categories = await CategoryModel.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const sanitized = sanitizeLeanArray(categories as any);

  await cacheService.set(CACHE_KEYS.CATALOG.CATEGORIES_PUBLIC, sanitized, PUBLIC_LIST_TTL_SECONDS);
  return sanitized;
}

export async function listAllCategories() {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.CATALOG.CATEGORIES_ALL);
  if (cached) return cached;

  const categories = await CategoryModel.find({})
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const sanitized = sanitizeLeanArray(categories as any);
  await cacheService.set(CACHE_KEYS.CATALOG.CATEGORIES_ALL, sanitized, ADMIN_LIST_TTL_SECONDS);
  return sanitized;
}

export async function getCategoryById(categoryId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.CATALOG.CATEGORY_BY_ID(categoryId));
  if (cached) return cached;

  const category = await CategoryModel.findById(categoryId).lean();
  if (!category) throw new AppError('Category not found', 404, 'not_found');

  const sanitized = sanitizeLeanDoc(category as any);
  await cacheService.set(CACHE_KEYS.CATALOG.CATEGORY_BY_ID(categoryId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function getCategoryAdminById(categoryId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.CATALOG.CATEGORY_ADMIN_BY_ID(categoryId));
  if (cached) return cached;

  const category = await CategoryModel.findById(categoryId).lean();
  if (!category) throw new AppError('Category not found', 404, 'not_found');

  const sanitized = sanitizeLeanDoc(category as any);
  await cacheService.set(CACHE_KEYS.CATALOG.CATEGORY_ADMIN_BY_ID(categoryId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function createCategory(input: {
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  imageUrl?: string;
  parentCategoryId?: string;
  isActive?: boolean;
  sortOrder?: number;
}) {
  const base = slugify(input.name?.en || input.name?.ar || "category") || "category";
  let slug = "";
  for (let i = 0; i < 20; i++) {
    const candidate = `${base}-${randomCode(6).toLowerCase()}`;
    const exists = await CategoryModel.exists({ slug: candidate });
    if (!exists) {
      slug = candidate;
      break;
    }
  }
  if (!slug) throw new AppError("Could not generate slug", 500, "server_error");

  const parentCategoryId = input.parentCategoryId
    ? new Types.ObjectId(input.parentCategoryId)
    : undefined;

  if (parentCategoryId) {
    const parentExists = await CategoryModel.exists({ _id: parentCategoryId });
    if (!parentExists) throw new AppError('Parent category not found', 400, 'validation_error');
  }

  const category = await CategoryModel.create({
    slug,
    name: input.name,
    description: input.description ?? { ar: '', en: '' },
    imageUrl: input.imageUrl?.trim() || undefined,
    parentCategoryId,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });

  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORIES_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORIES_ALL);
  await publishCategoryCreated({ categoryId: category._id.toString(), slug: category.slug });

  return category;
}

export async function updateCategory(
  categoryId: string,
  input: Partial<{
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    imageUrl: string | null;
    parentCategoryId: string | null;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  const update: any = { ...input };
  delete update.slug;

  if (Object.prototype.hasOwnProperty.call(update, 'parentCategoryId')) {
    if (update.parentCategoryId === null) {
      update.parentCategoryId = undefined;
    } else if (typeof update.parentCategoryId === 'string') {
      const parentId = new Types.ObjectId(update.parentCategoryId);
      const parentExists = await CategoryModel.exists({ _id: parentId });
      if (!parentExists) throw new AppError('Parent category not found', 400, 'validation_error');
      update.parentCategoryId = parentId;
    }
  }
  if (Object.prototype.hasOwnProperty.call(update, 'imageUrl') && update.imageUrl === null) {
    update.imageUrl = undefined;
  }

  const category = await CategoryModel.findByIdAndUpdate(categoryId, update, { new: true });
  if (!category) throw new AppError('Category not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORIES_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORIES_ALL);
  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORY_BY_ID(categoryId));
  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORY_ADMIN_BY_ID(categoryId));
  await publishCategoryUpdated({ categoryId: category._id.toString(), slug: category.slug });

  return category;
}

export async function deleteCategory(categoryId: string) {
  const oid = new Types.ObjectId(categoryId);

  // If this category has children, detach them (make them top-level).
  await CategoryModel.updateMany({ parentCategoryId: oid }, { $unset: { parentCategoryId: "" } });

  // If products reference this category, remove it from their categoryIds.
  await ProductModel.updateMany({ categoryIds: oid }, { $pull: { categoryIds: oid } });

  const inOffers = await OfferModel.exists({ targetType: 'category', targetIds: oid });
  if (inOffers) throw new AppError('Cannot delete a category referenced by offers', 409, 'conflict');

  const doc = await CategoryModel.findByIdAndDelete(categoryId);
  if (!doc) throw new AppError('Category not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORIES_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORIES_ALL);
  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORY_BY_ID(categoryId));
  await cacheService.del(CACHE_KEYS.CATALOG.CATEGORY_ADMIN_BY_ID(categoryId));
}
