import { Types } from 'mongoose';
import { CACHE_KEYS } from '../../../infrastructure/cache/cache.keys';
import { cacheService } from '../../../infrastructure/cache/cache.service';
import { AppError } from '../../../shared/middleware/errorHandler';
import { sanitizeLeanArray, sanitizeLeanDoc } from '../../../shared/utils/sanitizeLean';
import { randomCode, slugify } from '../../../shared/utils/slug';
import { CollectionModel } from '../models/collection.model';
import { ProductModel } from '../models/product.model';
import { OfferModel } from '../../marketing/models/offer.model';

const PUBLIC_LIST_TTL_SECONDS = 60;
const BY_ID_TTL_SECONDS = 5 * 60;
const ADMIN_LIST_TTL_SECONDS = 30;

async function ensureProductsExist(productIds: string[]) {
  if (productIds.length === 0) return;
  const ids = productIds.map((id) => new Types.ObjectId(id));
  const count = await ProductModel.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) throw new AppError('Invalid productIds', 400, 'validation_error');
}

export async function listPublicCollections() {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.CATALOG.COLLECTIONS_PUBLIC);
  if (cached) return cached;

  const collections = await CollectionModel.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const sanitized = sanitizeLeanArray(collections as any);
  await cacheService.set(CACHE_KEYS.CATALOG.COLLECTIONS_PUBLIC, sanitized, PUBLIC_LIST_TTL_SECONDS);
  return sanitized;
}

export async function listAllCollections() {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.CATALOG.COLLECTIONS_ALL);
  if (cached) return cached;

  const collections = await CollectionModel.find({})
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const sanitized = sanitizeLeanArray(collections as any);
  await cacheService.set(CACHE_KEYS.CATALOG.COLLECTIONS_ALL, sanitized, ADMIN_LIST_TTL_SECONDS);
  return sanitized;
}

export async function getCollectionById(collectionId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.CATALOG.COLLECTION_BY_ID(collectionId));
  if (cached) return cached;

  const collection = await CollectionModel.findById(collectionId).lean();
  if (!collection) throw new AppError('Collection not found', 404, 'not_found');

  const sanitized = sanitizeLeanDoc(collection as any);
  await cacheService.set(CACHE_KEYS.CATALOG.COLLECTION_BY_ID(collectionId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function getCollectionAdminById(collectionId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.CATALOG.COLLECTION_ADMIN_BY_ID(collectionId));
  if (cached) return cached;

  const collection = await CollectionModel.findById(collectionId).lean();
  if (!collection) throw new AppError('Collection not found', 404, 'not_found');

  const sanitized = sanitizeLeanDoc(collection as any);
  await cacheService.set(CACHE_KEYS.CATALOG.COLLECTION_ADMIN_BY_ID(collectionId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function createCollection(input: {
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  productIds?: string[];
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}) {
  const base = slugify(input.name?.en || input.name?.ar || "collection") || "collection";
  let slug = "";
  for (let i = 0; i < 20; i++) {
    const candidate = `${base}-${randomCode(6).toLowerCase()}`;
    const exists = await CollectionModel.exists({ slug: candidate });
    if (!exists) {
      slug = candidate;
      break;
    }
  }
  if (!slug) throw new AppError("Could not generate slug", 500, "server_error");
  const productIds = input.productIds ?? [];

  await ensureProductsExist(productIds);

  const collection = await CollectionModel.create({
    slug,
    name: input.name,
    description: input.description ?? { ar: '', en: '' },
    productIds: productIds.map((id) => new Types.ObjectId(id)),
    imageUrl: input.imageUrl,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });

  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTIONS_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTIONS_ALL);
  return collection;
}

export async function updateCollection(
  collectionId: string,
  input: Partial<{
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    productIds: string[];
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  const update: any = { ...input };
  delete update.slug;

  if (Array.isArray(update.productIds)) {
    await ensureProductsExist(update.productIds);
    update.productIds = update.productIds.map((id: string) => new Types.ObjectId(id));
  }

  if (Object.prototype.hasOwnProperty.call(update, 'imageUrl') && update.imageUrl === null) {
    update.imageUrl = undefined;
  }

  const collection = await CollectionModel.findByIdAndUpdate(collectionId, update, { new: true });
  if (!collection) throw new AppError('Collection not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTIONS_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTIONS_ALL);
  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTION_BY_ID(collectionId));
  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTION_ADMIN_BY_ID(collectionId));
  return collection;
}

export async function deleteCollection(collectionId: string) {
  const oid = new Types.ObjectId(collectionId);

  const inOffers = await OfferModel.exists({ targetType: 'collection', targetIds: oid });
  if (inOffers) throw new AppError('Cannot delete a collection referenced by offers', 409, 'conflict');

  const doc = await CollectionModel.findByIdAndDelete(collectionId);
  if (!doc) throw new AppError('Collection not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTIONS_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTIONS_ALL);
  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTION_BY_ID(collectionId));
  await cacheService.del(CACHE_KEYS.CATALOG.COLLECTION_ADMIN_BY_ID(collectionId));
}
