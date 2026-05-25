import { Types } from 'mongoose';
import { AppError } from '../../../shared/middleware/errorHandler';
import { ProductModel } from '../../catalog/models/product.model';
import { LookbookItemModel } from '../models/lookbookItem.model';
import { LookbookModel } from '../models/lookbook.model';
import { randomCode, slugify } from '../../../shared/utils/slug';

type LocalizedString = { ar: string; en: string };

function normalizeLocalizedString(value: unknown): LocalizedString {
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    return {
      ar: typeof v.ar === 'string' ? v.ar : '',
      en: typeof v.en === 'string' ? v.en : '',
    };
  }

  const fallback = typeof value === 'string' ? value : '';
  return { ar: fallback, en: fallback };
}

function serializeLookbook(raw: any) {
  const item = LookbookModel.hydrate(raw).toJSON() as any;
  item.title = normalizeLocalizedString(raw?.title ?? item.title);
  item.description = normalizeLocalizedString(raw?.description ?? item.description);
  // normalize linkedProductId to a string when present so downstream code
  // (which expects a string id) can operate correctly
  item.linkedProductId =
    raw?.linkedProductId?.toString?.() ?? item.linkedProductId?.toString?.() ?? item.linkedProductId;
  return item;
}

function serializeProduct(raw: any) {
  const item = ProductModel.hydrate(raw).toJSON() as any;
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    price: item.price,
    images: item.images ?? [],
    isActive: item.isActive,
  };
}

function serializeLookbookItem(raw: any) {
  const item = LookbookItemModel.hydrate(raw).toJSON() as any;
  item.caption = normalizeLocalizedString(raw?.caption ?? item.caption);
  item.linkedProducts = (raw?.linkedProducts ?? item.linkedProducts ?? []).map((entry: any) => {
    if (entry && typeof entry === 'object' && ('slug' in entry || 'name' in entry)) {
      return {
        ...entry,
        id: entry.id?.toString?.() ?? entry._id?.toString?.() ?? entry.id ?? entry._id,
      };
    }
    return entry?.toString?.() ?? entry;
  });
  return item;
}

export async function listLookbooksAdmin() {
  const rows = await LookbookModel.find().sort({ updatedAt: -1 }).lean();
  return rows.map(serializeLookbook);
}

export async function getLookbookAdmin(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid id', 400, 'validation_error');
  const doc = await LookbookModel.findById(id);
  if (!doc) throw new AppError('Lookbook not found', 404, 'not_found');
  return doc;
}

async function assertSlugAvailable(slug: string, excludeId?: string) {
  const q: any = { slug };
  if (excludeId && Types.ObjectId.isValid(excludeId)) q._id = { $ne: excludeId };
  const exists = await LookbookModel.exists(q);
  if (exists) throw new AppError('Slug already exists', 409, 'conflict');
}

async function buildUniqueSlug(title: LocalizedString, excludeId?: string) {
  const base = slugify(title.en || title.ar || 'lookbook') || 'lookbook';
  for (let i = 0; i < 20; i++) {
    const candidate = `${base}-${randomCode(4).toLowerCase()}`;
    const q: any = { slug: candidate };
    if (excludeId && Types.ObjectId.isValid(excludeId)) q._id = { $ne: excludeId };
    const exists = await LookbookModel.exists(q);
    if (!exists) return candidate;
  }
  throw new AppError('Could not generate unique slug', 500, 'internal_error');
}

async function attachLookbookProducts(lookbooks: any[]) {
  const ids = lookbooks.map((l) => l.id).filter(Boolean);
  if (!ids.length) return lookbooks.map((l) => ({ ...l, products: [] }));

  const linkedProductIds = lookbooks
    .map((l) => l.linkedProductId)
    .filter((id) => typeof id === 'string' && Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  const items = await LookbookItemModel.find({
    lookbookId: { $in: ids.map((id) => new Types.ObjectId(id)) },
    linkedProducts: { $exists: true, $ne: [] as any },
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .populate({
      path: 'linkedProducts',
      select: 'slug name price images isActive',
    })
    .lean();

  const linkedProducts = linkedProductIds.length
    ? await ProductModel.find({ _id: { $in: linkedProductIds } })
        .select('slug name price images isActive')
        .lean()
    : [];

  const productLookup = new Map<string, any>();
  for (const product of linkedProducts) {
    const serialized = serializeProduct(product);
    if (serialized.id) productLookup.set(serialized.id, serialized);
  }

  const productsByLookbook = new Map<string, any[]>();
  for (const lookbook of lookbooks) {
    const lookbookId = lookbook.id?.toString?.() ?? String(lookbook.id);
    const initial: any[] = [];
    const seen = new Set<string>();

    const linkedProductId = lookbook.linkedProductId?.toString?.();
    if (linkedProductId && productLookup.has(linkedProductId)) {
      const serialized = productLookup.get(linkedProductId);
      initial.push(serialized);
      seen.add(serialized.id);
    }

    productsByLookbook.set(lookbookId, initial);
  }

  for (const row of items) {
    const lookbookId = row.lookbookId?.toString?.() ?? String(row.lookbookId);
    const current = productsByLookbook.get(lookbookId) ?? [];
    const seen = new Set(current.map((p) => p.id));
    for (const product of row.linkedProducts ?? []) {
      if (!product || typeof product !== 'object') continue;
      const serialized = serializeProduct(product);
      if (!serialized.id || seen.has(serialized.id)) continue;
      seen.add(serialized.id);
      current.push(serialized);
    }
    productsByLookbook.set(lookbookId, current);
  }

  return lookbooks.map((l) => ({ ...l, products: productsByLookbook.get(l.id) ?? [] }));
}

export async function createLookbook(input: {
  title: LocalizedString;
  slug?: string;
  description: LocalizedString;
  coverImage?: string;
  published?: boolean;
  linkedProductId?: string | null;
}) {
  const nextSlug = input.slug?.trim() || (await buildUniqueSlug(input.title));
  await assertSlugAvailable(nextSlug);
  const doc = await LookbookModel.create({
    title: normalizeLocalizedString(input.title),
    slug: nextSlug,
    description: normalizeLocalizedString(input.description),
    coverImage: input.coverImage,
    published: input.published ?? false,
    linkedProductId:
      input.linkedProductId && Types.ObjectId.isValid(input.linkedProductId)
        ? new Types.ObjectId(input.linkedProductId)
        : undefined,
  });
  return doc;
}

export async function patchLookbook(id: string, patch: Partial<{
  title: LocalizedString;
  slug: string;
  description: LocalizedString;
  coverImage: string;
  published: boolean;
  linkedProductId?: string | null;
}>) {
  const doc = await getLookbookAdmin(id);
  const nextPatch: Record<string, unknown> = { ...patch };
  if ('title' in nextPatch) nextPatch.title = normalizeLocalizedString(nextPatch.title);
  if ('description' in nextPatch) nextPatch.description = normalizeLocalizedString(nextPatch.description);
  if (!patch.slug && patch.title) nextPatch.slug = await buildUniqueSlug(normalizeLocalizedString(patch.title), id);
  if (patch.slug && patch.slug !== doc.slug) await assertSlugAvailable(patch.slug, id);

  if ('linkedProductId' in nextPatch) {
    const linkedProductId = nextPatch.linkedProductId;
    if (typeof linkedProductId === 'string' && Types.ObjectId.isValid(linkedProductId)) {
      nextPatch.linkedProductId = new Types.ObjectId(linkedProductId);
    } else {
      nextPatch.linkedProductId = undefined;
    }
  }

  Object.assign(doc, nextPatch);
  await doc.save();
  return doc;
}

export async function deleteLookbook(id: string) {
  const doc = await getLookbookAdmin(id);
  await Promise.all([
    LookbookItemModel.deleteMany({ lookbookId: doc._id }),
    LookbookModel.deleteOne({ _id: doc._id }),
  ]);
}

export async function listLookbooksPublic() {
  const rows = await LookbookModel.find({ published: true }).sort({ updatedAt: -1 }).lean();
  const lookbooks = rows.map(serializeLookbook) as any[];

  const needsCover = lookbooks.filter((l) => !l.coverImage).map((l) => l.id).filter(Boolean);
  if (!needsCover.length) return lookbooks;

  const firstItems = await LookbookItemModel.aggregate([
    { $match: { lookbookId: { $in: needsCover.map((x) => new Types.ObjectId(x)) } } },
    { $sort: { sortOrder: 1, createdAt: 1 } },
    {
      $group: {
        _id: '$lookbookId',
        image: { $first: '$image' },
      },
    },
  ]);

  const imageByLookbookId = new Map<string, string>();
  for (const r of firstItems) imageByLookbookId.set(r._id?.toString?.() ?? String(r._id), r.image);

  const normalized = lookbooks.map((l) => ({ ...l, coverImage: l.coverImage || imageByLookbookId.get(l.id) }));
  return attachLookbookProducts(normalized);
}

export async function getLookbookPublicBySlug(slug: string) {
  const lookbook = await LookbookModel.findOne({ slug, published: true });
  if (!lookbook) throw new AppError('Lookbook not found', 404, 'not_found');

  const items = await LookbookItemModel.find({ lookbookId: lookbook._id })
    .sort({ sortOrder: 1, createdAt: 1 })
    .populate({
      path: 'linkedProducts',
      select: 'slug name price images isActive',
    })
    .lean();

  const normalizedItems = items.map(serializeLookbookItem);
  const lookbookDto = serializeLookbook(lookbook.toObject());
  if (lookbookDto.linkedProductId) {
    const linkedProduct = await ProductModel.findById(lookbookDto.linkedProductId)
      .select('slug name price images isActive')
      .lean();
    if (linkedProduct) {
      lookbookDto.products = [serializeProduct(linkedProduct)];
    }
  }

  return { lookbook: lookbookDto, items: normalizedItems };
}

export async function listLookbookItemsAdmin(lookbookId: string) {
  if (!Types.ObjectId.isValid(lookbookId)) throw new AppError('Invalid id', 400, 'validation_error');
  const items = await LookbookItemModel.find({ lookbookId })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return items.map(serializeLookbookItem);
}

export async function createLookbookItemsBulk(
  lookbookId: string,
  input: Array<{
    image: string;
    caption?: LocalizedString;
    sortOrder?: number;
    linkedProducts?: string[];
    hotspots?: Array<{ x: number; y: number; productId: string }>;
  }>
) {
  if (!Types.ObjectId.isValid(lookbookId)) throw new AppError('Invalid id', 400, 'validation_error');
  const max = await LookbookItemModel.findOne({ lookbookId }).sort({ sortOrder: -1 }).select('sortOrder').lean();
  const base = typeof max?.sortOrder === 'number' ? max.sortOrder + 10 : 0;

  const docs = await LookbookItemModel.insertMany(
    input.map((it, idx) => ({
      lookbookId,
      image: it.image,
      caption: normalizeLocalizedString(it.caption),
      sortOrder: it.sortOrder ?? base + idx * 10,
      linkedProducts: (it.linkedProducts ?? []).filter((x) => Types.ObjectId.isValid(x)),
      hotspots: (it.hotspots ?? []).filter((h) => Types.ObjectId.isValid(h.productId)),
    })),
    { ordered: true }
  );

  return docs.map((d) => serializeLookbookItem(d.toObject()));
}

export async function patchLookbookItem(
  lookbookId: string,
  itemId: string,
  patch: Partial<{
    image: string;
    caption: LocalizedString;
    sortOrder: number;
    linkedProducts: string[];
    hotspots: Array<{ x: number; y: number; productId: string }>;
  }>
) {
  if (!Types.ObjectId.isValid(lookbookId) || !Types.ObjectId.isValid(itemId)) {
    throw new AppError('Invalid id', 400, 'validation_error');
  }
  const doc = await LookbookItemModel.findOne({ _id: itemId, lookbookId });
  if (!doc) throw new AppError('Lookbook item not found', 404, 'not_found');

  const next: any = { ...patch };
  if ('caption' in next) next.caption = normalizeLocalizedString(next.caption);
  if (next.linkedProducts) next.linkedProducts = next.linkedProducts.filter((x: string) => Types.ObjectId.isValid(x));
  if (next.hotspots) next.hotspots = next.hotspots.filter((h: any) => Types.ObjectId.isValid(h.productId));

  Object.assign(doc, next);
  await doc.save();
  return doc;
}

export async function deleteLookbookItem(lookbookId: string, itemId: string) {
  if (!Types.ObjectId.isValid(lookbookId) || !Types.ObjectId.isValid(itemId)) {
    throw new AppError('Invalid id', 400, 'validation_error');
  }
  await LookbookItemModel.deleteOne({ _id: itemId, lookbookId });
}

export async function reorderLookbookItems(
  lookbookId: string,
  input: Array<{ id: string; sortOrder: number }>
) {
  if (!Types.ObjectId.isValid(lookbookId)) throw new AppError('Invalid id', 400, 'validation_error');
  const ops = input
    .filter((x) => Types.ObjectId.isValid(x.id) && Number.isFinite(x.sortOrder))
    .map((x) => ({
      updateOne: {
        filter: { _id: x.id, lookbookId },
        update: { $set: { sortOrder: x.sortOrder } },
      },
    }));
  if (!ops.length) return;
  await LookbookItemModel.bulkWrite(ops);
}
