import { Types } from 'mongoose';
import { CACHE_KEYS } from '../../../infrastructure/cache/cache.keys';
import { cacheService } from '../../../infrastructure/cache/cache.service';
import { publishProductCreated, publishProductUpdated } from '../../../infrastructure/messaging/publisher';
import { AppError } from '../../../shared/middleware/errorHandler';
import { sanitizeLeanArray, sanitizeLeanDoc } from '../../../shared/utils/sanitizeLean';
import { randomCode, slugify } from '../../../shared/utils/slug';
import { CategoryModel } from '../models/category.model';
import { OptionModel } from '../models/option.model';
import { ProductModel } from '../models/product.model';
import { OrderModel } from '../../orders/models/order.model';
import { resolveOfferPricingForProducts } from '../../marketing/services/offerPricing.service';
import { StockItemModel } from '../../stock/models/stock.model';
import { ReviewModel } from '../../reviews/models/review.model';
import { CollectionModel } from '../models/collection.model';

const PUBLIC_LIST_TTL_SECONDS = 30;
const BY_ID_TTL_SECONDS = 2 * 60;
const ADMIN_LIST_TTL_SECONDS = 20;

function decimalToNumber(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = v?.toString?.();
  const n = typeof s === 'string' ? Number(s) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function ensureIdsExist(model: any, ids: string[], field: string) {
  if (ids.length === 0) return;
  const objectIds = ids.map((id) => new Types.ObjectId(id));
  const count = await model.countDocuments({ _id: { $in: objectIds } });
  if (count !== objectIds.length) {
    throw new AppError(`Invalid ${field}`, 400, 'validation_error');
  }
}

async function ensureOptionSelectionsValid(
  selections: Array<{ optionId: string; valueKeys: string[] }>
) {
  if (selections.length === 0) return;

  const optionIds = selections.map((s) => s.optionId);
  await ensureIdsExist(OptionModel, optionIds, 'optionIds');

  const options = await OptionModel.find({ _id: { $in: optionIds.map((id) => new Types.ObjectId(id)) } })
    .select({ values: 1 })
    .lean();

  const byId = new Map<string, Set<string>>();
  for (const o of options as any[]) {
    const id = (o._id?.toString?.() ?? o._id) as string;
    const keys = new Set<string>((o.values ?? []).map((v: any) => v.key));
    byId.set(id, keys);
  }

  for (const sel of selections) {
    const allowed = byId.get(sel.optionId);
    if (!allowed) throw new AppError('Invalid optionId', 400, 'validation_error');
    for (const k of sel.valueKeys ?? []) {
      if (!allowed.has(k)) throw new AppError('Invalid option value key', 400, 'validation_error');
    }
  }
}

export async function listPublicProducts() {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.CATALOG.PRODUCTS_PUBLIC);
  if (cached) return cached;

  const products = await ProductModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();

  const sanitized = sanitizeLeanArray(products as any).map((p: any) => ({
    ...p,
    options: Array.isArray(p.options) ? p.options : [],
    isFeatured: !!p.isFeatured,
    price: decimalToNumber(p.price),
  }));
  const productIds = sanitized.map((p: any) => String(p.id));
  const stockRows = await StockItemModel.find({
    productId: { $in: productIds.map((id) => new Types.ObjectId(id)) },
  })
    .select({ productId: 1, availableQty: 1 })
    .lean();
  const stockByProduct = new Map<string, boolean>(
    (stockRows as any[]).map((s) => [String(s.productId), Number(s.availableQty) > 0])
  );
  const ratingRows = await ReviewModel.aggregate([
    { $match: { status: 'approved', productId: { $in: productIds.map((id) => new Types.ObjectId(id)) } } },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);
  const ratingByProduct = new Map<string, { avgRating: number; reviewCount: number }>(
    ratingRows.map((r: any) => [String(r._id), { avgRating: decimalToNumber(r.avgRating), reviewCount: Number(r.reviewCount) || 0 }])
  );
  const collectionRows = await CollectionModel.find({
    productIds: { $in: productIds.map((id) => new Types.ObjectId(id)) },
  })
    .select({ productIds: 1 })
    .lean();
  const collectionsByProduct = new Map<string, string[]>();
  for (const row of collectionRows as any[]) {
    const collectionId = String(row._id);
    for (const pid of row.productIds ?? []) {
      const key = String(pid);
      const list = collectionsByProduct.get(key) ?? [];
      list.push(collectionId);
      collectionsByProduct.set(key, list);
    }
  }
  const enriched = sanitized.map((p: any) => {
    const id = String(p.id);
    const rating = ratingByProduct.get(id);
    return {
      ...p,
      inStock: stockByProduct.get(id) ?? false,
      avgRating: rating?.avgRating ?? 0,
      reviewCount: rating?.reviewCount ?? 0,
      collectionIds: collectionsByProduct.get(id) ?? [],
    };
  });
  const offers = await resolveOfferPricingForProducts(
    enriched.map((p: any) => ({
      id: String(p.id),
      price: decimalToNumber(p.price),
      categoryIds: (p.categoryIds ?? []).map((x: any) => String(x)),
    }))
  );
  const withOffers = enriched.map((p: any) => {
    const offer = offers.get(String(p.id));
    if (!offer) return p;
    return {
      ...p,
      originalPrice: offer.originalPrice,
      price: offer.finalPrice,
      hasOffer: true,
      offerLabel: offer.offerLabel,
      offerBadge: offer.offerBadge,
    };
  });
  await cacheService.set(CACHE_KEYS.CATALOG.PRODUCTS_PUBLIC, withOffers, PUBLIC_LIST_TTL_SECONDS);
  return withOffers;
}

export async function listAllProducts() {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.CATALOG.PRODUCTS_ALL);
  if (cached) return cached;

  const products = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
  const sanitized = sanitizeLeanArray(products as any).map((p: any) => ({
    ...p,
    options: Array.isArray(p.options) ? p.options : [],
    isFeatured: !!p.isFeatured,
    price: decimalToNumber(p.price),
  }));

  await cacheService.set(CACHE_KEYS.CATALOG.PRODUCTS_ALL, sanitized, ADMIN_LIST_TTL_SECONDS);
  return sanitized;
}

export async function getProductById(productId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.CATALOG.PRODUCT_BY_ID(productId));
  if (cached) return cached;

  const product = await ProductModel.findById(productId).lean();
  if (!product) throw new AppError('Product not found', 404, 'not_found');

  const sanitized: any = sanitizeLeanDoc(product as any);
  sanitized.options = Array.isArray(sanitized.options) ? sanitized.options : [];
  sanitized.isFeatured = !!sanitized.isFeatured;
  sanitized.price = decimalToNumber((product as any).price);
  const offers = await resolveOfferPricingForProducts([
    {
      id: String(sanitized.id),
      price: decimalToNumber((product as any).price),
      categoryIds: (sanitized.categoryIds ?? []).map((x: any) => String(x)),
    },
  ]);
  const offer = offers.get(String(sanitized.id));
  if (offer) {
    sanitized.originalPrice = offer.originalPrice;
    sanitized.price = offer.finalPrice;
    sanitized.hasOffer = true;
    sanitized.offerLabel = offer.offerLabel;
    sanitized.offerBadge = offer.offerBadge;
  }
  await cacheService.set(CACHE_KEYS.CATALOG.PRODUCT_BY_ID(productId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function getProductAdminById(productId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.CATALOG.PRODUCT_ADMIN_BY_ID(productId));
  if (cached) return cached;

  const product = await ProductModel.findById(productId).lean();
  if (!product) throw new AppError('Product not found', 404, 'not_found');

  const sanitized: any = sanitizeLeanDoc(product as any);
  sanitized.options = Array.isArray(sanitized.options) ? sanitized.options : [];
  sanitized.isFeatured = !!sanitized.isFeatured;
  sanitized.price = decimalToNumber((product as any).price);
  await cacheService.set(CACHE_KEYS.CATALOG.PRODUCT_ADMIN_BY_ID(productId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function createProduct(input: {
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  price: number;
  categoryIds?: string[];
  optionIds?: string[];
  options?: Array<{ optionId: string; valueKeys: string[] }>;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}) {
  const base = slugify(input.name?.en || input.name?.ar || "product") || "product";
  let slug = "";
  let sku: string | undefined;
  for (let i = 0; i < 20; i++) {
    const code = randomCode(6).toLowerCase();
    slug = `${base}-${code}`;
    sku = `SKU-${randomCode(8)}`;
    const exists = await ProductModel.exists({ slug });
    if (!exists) break;
  }
  if (!slug) throw new AppError("Could not generate slug", 500, "server_error");
  const categoryIds = input.categoryIds ?? [];
  const optionSelections = input.options ?? [];
  const optionIds = optionSelections.length ? optionSelections.map((s) => s.optionId) : input.optionIds ?? [];

  await ensureIdsExist(CategoryModel, categoryIds, 'categoryIds');
  await ensureIdsExist(OptionModel, optionIds, 'optionIds');
  await ensureOptionSelectionsValid(optionSelections);

  const product = await ProductModel.create({
    slug,
    sku,
    name: input.name,
    description: input.description ?? { ar: '', en: '' },
    price: input.price as any,
    categoryIds: categoryIds.map((id) => new Types.ObjectId(id)),
    optionIds: optionIds.map((id) => new Types.ObjectId(id)),
    options: optionSelections.map((s) => ({
      optionId: new Types.ObjectId(s.optionId),
      valueKeys: s.valueKeys ?? [],
    })),
    images: input.images ?? [],
    isActive: input.isActive ?? true,
    isFeatured: input.isFeatured ?? false,
  });

  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCTS_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCTS_ALL);
  await publishProductCreated({ productId: product._id.toString(), slug: product.slug });

  return product;
}

export async function updateProduct(
  productId: string,
  input: Partial<{
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    price: number;
    categoryIds: string[];
    optionIds: string[];
    options: Array<{ optionId: string; valueKeys: string[] }>;
    images: string[];
    isActive: boolean;
    isFeatured: boolean;
  }>
) {
  const update: any = { ...input };
  // slug & sku are system-generated and not editable via update.
  delete update.slug;
  delete update.sku;

  if (Array.isArray(update.categoryIds)) {
    await ensureIdsExist(CategoryModel, update.categoryIds, 'categoryIds');
    update.categoryIds = update.categoryIds.map((id: string) => new Types.ObjectId(id));
  }
  if (Array.isArray(update.optionIds)) {
    await ensureIdsExist(OptionModel, update.optionIds, 'optionIds');
    update.optionIds = update.optionIds.map((id: string) => new Types.ObjectId(id));
  }

  if (Array.isArray(update.options)) {
    await ensureOptionSelectionsValid(update.options);
    update.optionIds = update.options.map((s: any) => new Types.ObjectId(s.optionId));
    update.options = update.options.map((s: any) => ({
      optionId: new Types.ObjectId(s.optionId),
      valueKeys: Array.isArray(s.valueKeys) ? s.valueKeys : [],
    }));
  }

  const product = await ProductModel.findByIdAndUpdate(productId, update, { new: true });
  if (!product) throw new AppError('Product not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCTS_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCT_BY_ID(productId));
  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCTS_ALL);
  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCT_ADMIN_BY_ID(productId));
  await publishProductUpdated({ productId: product._id.toString(), slug: product.slug });

  return product;
}

export async function getProductBySlug(slug: string) {
  const s = String(slug || '').toLowerCase().trim();
  const product = await ProductModel.findOne({ slug: s }).lean();
  if (!product) throw new AppError('Product not found', 404, 'not_found');
  const sanitized: any = sanitizeLeanDoc(product as any);
  sanitized.options = Array.isArray(sanitized.options) ? sanitized.options : [];
  sanitized.isFeatured = !!sanitized.isFeatured;
  sanitized.price = decimalToNumber((product as any).price);
  const offers = await resolveOfferPricingForProducts([
    {
      id: String(sanitized.id),
      price: decimalToNumber((product as any).price),
      categoryIds: (sanitized.categoryIds ?? []).map((x: any) => String(x)),
    },
  ]);
  const offer = offers.get(String(sanitized.id));
  if (offer) {
    sanitized.originalPrice = offer.originalPrice;
    sanitized.price = offer.finalPrice;
    sanitized.hasOffer = true;
    sanitized.offerLabel = offer.offerLabel;
    sanitized.offerBadge = offer.offerBadge;
  }
  return sanitized;
}

/** Storefront PDP: active product plus option docs filtered by allowed keys. */
export async function getProductStoreDetail(productId: string) {
  const raw: any = await getProductById(productId);
  if (!raw.isActive) throw new AppError('Product not found', 404, 'not_found');

  const rows = Array.isArray(raw.options) ? raw.options : [];
  const optIds = [...new Set(rows.map((r: any) => String(r.optionId)))] as string[];

  const optionDocs =
    optIds.length === 0
      ? []
      : await OptionModel.find({
          _id: { $in: optIds.map((id) => new Types.ObjectId(id)) },
          isActive: true,
        }).lean();

  const allowedByOption = new Map<string, Set<string>>();
  for (const r of rows) {
    const oid = String(r.optionId);
    const keys = Array.isArray(r.valueKeys) ? r.valueKeys : [];
    allowedByOption.set(oid, new Set(keys));
  }

  const options = (optionDocs as any[]).map((o) => {
    const id = o._id.toString();
    const allow = allowedByOption.get(id);
    let values = Array.isArray(o.values) ? [...o.values] : [];
    if (allow && allow.size > 0) {
      values = values.filter((v: any) => allow!.has(v.key));
    }
    const sanitized = sanitizeLeanDoc(o as any);
    return { ...sanitized, values };
  });

  // `raw` is already sanitized by `getProductById`; do not re-sanitize or `id` will be lost.
  const product = {
    ...raw,
    price: decimalToNumber(raw.price),
  };

  return { product, options };
}

export async function getProductStoreDetailBySlug(slug: string) {
  const raw: any = await getProductBySlug(slug);
  if (!raw.isActive) throw new AppError('Product not found', 404, 'not_found');
  return getProductStoreDetail(raw.id);
}

export async function deleteProduct(productId: string) {
  const oid = new Types.ObjectId(productId);
  const ordered = await OrderModel.exists({ 'items.productId': oid });
  if (ordered) {
    throw new AppError('Cannot delete a product that appears in orders', 409, 'conflict');
  }

  const doc = await ProductModel.findByIdAndDelete(productId);
  if (!doc) throw new AppError('Product not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCTS_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCT_BY_ID(productId));
  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCTS_ALL);
  await cacheService.del(CACHE_KEYS.CATALOG.PRODUCT_ADMIN_BY_ID(productId));
}
