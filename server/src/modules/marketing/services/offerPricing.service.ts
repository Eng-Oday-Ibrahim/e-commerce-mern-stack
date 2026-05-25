import { Types } from 'mongoose';
import { CollectionModel } from '../../catalog/models/collection.model';
import { OfferModel } from '../models/offer.model';

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function decToNum(v: any): number {
  const raw = v?.toString?.() ?? v;
  const n = typeof raw === 'string' ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function isOfferActiveNow(offer: any, now: number): boolean {
  if (!offer?.isActive) return false;
  if (offer.startsAt && new Date(offer.startsAt).getTime() > now) return false;
  if (offer.endsAt && new Date(offer.endsAt).getTime() < now) return false;
  return true;
}

function applyOffer(basePrice: number, offer: any): number {
  if (typeof offer?.percentOff === 'number') {
    return round2(basePrice * (1 - offer.percentOff / 100));
  }
  if (offer?.fixedOff != null) {
    return round2(Math.max(0, basePrice - decToNum(offer.fixedOff)));
  }
  return basePrice;
}

export async function resolveOfferPricingForProducts(
  products: Array<{ id: string; price: number; categoryIds?: string[] }>
): Promise<Map<string, { finalPrice: number; originalPrice: number; offerLabel: string; offerBadge: string }>> {
  if (products.length === 0) return new Map();

  const productIds = products.map((p) => p.id);
  const productIdSet = new Set(productIds);
  const categoryIdSet = new Set<string>();
  for (const p of products) {
    for (const cid of p.categoryIds ?? []) categoryIdSet.add(cid);
  }

  const collections = await CollectionModel.find({
    productIds: { $in: productIds.map((id) => new Types.ObjectId(id)) },
  })
    .select({ productIds: 1 })
    .lean();

  const collectionIdSet = new Set<string>();
  const collectionsByProduct = new Map<string, Set<string>>();
  for (const c of collections as any[]) {
    const collectionId = String(c._id);
    collectionIdSet.add(collectionId);
    for (const pidRaw of c.productIds ?? []) {
      const pid = String(pidRaw);
      if (!productIdSet.has(pid)) continue;
      const set = collectionsByProduct.get(pid) ?? new Set<string>();
      set.add(collectionId);
      collectionsByProduct.set(pid, set);
    }
  }

  const categoryIds = Array.from(categoryIdSet);
  const collectionIds = Array.from(collectionIdSet);

  const orFilters: any[] = [
    { targetType: 'product', targetIds: { $in: productIds.map((id) => new Types.ObjectId(id)) } },
  ];
  if (categoryIds.length > 0) {
    orFilters.push({ targetType: 'category', targetIds: { $in: categoryIds.map((id) => new Types.ObjectId(id)) } });
  }
  if (collectionIds.length > 0) {
    orFilters.push({
      targetType: 'collection',
      targetIds: { $in: collectionIds.map((id) => new Types.ObjectId(id)) },
    });
  }

  const offers = await OfferModel.find({ isActive: true, $or: orFilters }).lean();
  const now = Date.now();

  const result = new Map<string, { finalPrice: number; originalPrice: number; offerLabel: string; offerBadge: string }>();
  for (const product of products) {
    const basePrice = round2(Math.max(0, product.price));
    let bestPrice = basePrice;
    let bestOffer: any = null;
    const categoryIdsForProduct = new Set(product.categoryIds ?? []);
    const collectionIdsForProduct = collectionsByProduct.get(product.id) ?? new Set<string>();

    for (const offer of offers as any[]) {
      if (!isOfferActiveNow(offer, now)) continue;
      const targetIds = new Set((offer.targetIds ?? []).map((id: any) => String(id)));
      let applies = false;
      if (offer.targetType === 'product') {
        applies = targetIds.has(product.id);
      } else if (offer.targetType === 'category') {
        applies = Array.from(categoryIdsForProduct).some((id) => targetIds.has(id));
      } else if (offer.targetType === 'collection') {
        applies = Array.from(collectionIdsForProduct).some((id) => targetIds.has(id));
      }
      if (!applies) continue;

      const discounted = applyOffer(basePrice, offer);
      if (discounted < bestPrice) {
        bestPrice = discounted;
        bestOffer = offer;
      }
    }

    if (bestOffer && bestPrice < basePrice) {
      const offerLabel =
        typeof bestOffer.percentOff === 'number'
          ? `${bestOffer.percentOff}% OFF`
          : `${round2(decToNum(bestOffer.fixedOff)).toFixed(2)} OFF`;
      result.set(product.id, {
        finalPrice: bestPrice,
        originalPrice: basePrice,
        offerLabel,
        offerBadge: '',
      });
    }
  }

  return result;
}
