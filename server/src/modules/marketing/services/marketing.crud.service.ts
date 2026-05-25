import { Types } from 'mongoose';
import { AppError } from '../../../shared/middleware/errorHandler';
import { AnnouncementModel } from '../models/announcement.model';
import { AbandonedCartModel } from '../models/abandonedCart.model';
import { CampaignModel } from '../models/campaign.model';
import { CouponModel } from '../models/coupon.model';
import { OfferModel } from '../models/offer.model';

function ensureCouponPricing(type: 'percent' | 'fixed', percentOff?: number, fixedOff?: number) {
  if (type === 'percent' && (percentOff == null || percentOff < 1)) {
    throw new AppError('percentOff required for percent coupons', 400, 'validation_error');
  }
  if (type === 'fixed' && (fixedOff == null || fixedOff < 0)) {
    throw new AppError('fixedOff required for fixed coupons', 400, 'validation_error');
  }
}

function ensureOfferPricing(percentOff?: number, fixedOff?: number) {
  const hasP = percentOff != null;
  const hasF = fixedOff != null;
  if (hasP === hasF) {
    throw new AppError('Offer requires exactly one of percentOff or fixedOff', 400, 'validation_error');
  }
}

/** ---------- Announcements ---------- */
export async function listAnnouncementsAdmin() {
  return AnnouncementModel.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
}

export async function listAnnouncementsActivePublic() {
  const rows = await AnnouncementModel.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
  const now = Date.now();
  return rows.filter((r: any) => {
    if (r.startsAt && new Date(r.startsAt).getTime() > now) return false;
    if (r.endsAt && new Date(r.endsAt).getTime() < now) return false;
    return true;
  });
}

export async function createAnnouncement(input: {
  message: { ar: string; en: string };
  isActive?: boolean;
  startsAt?: Date;
  endsAt?: Date;
  sortOrder?: number;
}) {
  return AnnouncementModel.create({
    message: input.message,
    isActive: input.isActive ?? true,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    sortOrder: input.sortOrder ?? 0,
  });
}

export async function updateAnnouncement(
  id: string,
  patch: Partial<{
    message: { ar: string; en: string };
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    sortOrder: number;
  }>
) {
  const doc = await AnnouncementModel.findByIdAndUpdate(id, patch, { new: true });
  if (!doc) throw new AppError('Announcement not found', 404, 'not_found');
  return doc;
}

export async function deleteAnnouncement(id: string) {
  const doc = await AnnouncementModel.findByIdAndDelete(id);
  if (!doc) throw new AppError('Announcement not found', 404, 'not_found');
}

/** ---------- Coupons ---------- */
export async function listCouponsAdmin() {
  return CouponModel.find({}).sort({ createdAt: -1 }).lean();
}

export async function createCoupon(input: {
  code: string;
  type: 'percent' | 'fixed';
  percentOff?: number;
  fixedOff?: number;
  minSubtotal?: number;
  maxRedemptions?: number | null;
  perCustomerMax?: number;
  currencyCode?: string;
  startsAt?: Date;
  endsAt?: Date;
  isActive?: boolean;
}) {
  ensureCouponPricing(input.type, input.percentOff, input.fixedOff);
  return CouponModel.create({
    code: input.code.toUpperCase(),
    type: input.type,
    percentOff: input.percentOff,
    fixedOff: input.fixedOff,
    minSubtotal: input.minSubtotal ?? 0,
    maxRedemptions: input.maxRedemptions ?? null,
    perCustomerMax: input.perCustomerMax ?? 1,
    currencyCode: input.currencyCode?.trim(),
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    isActive: input.isActive ?? true,
    redemptionsCount: 0,
  });
}

export async function updateCoupon(
  id: string,
  patch: Partial<{
    code: string;
    type: 'percent' | 'fixed';
    percentOff: number;
    fixedOff: number;
    minSubtotal: number;
    maxRedemptions: number | null;
    perCustomerMax: number;
    currencyCode: string;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
  }>
) {
  const $set: any = { ...patch };
  if (typeof $set.code === 'string') $set.code = $set.code.toUpperCase();
  for (const k of Object.keys($set)) {
    if ($set[k] === undefined) delete $set[k];
  }

  const $unset: Record<string, ''> = {};
  if ($set.type === 'percent' || (Object.prototype.hasOwnProperty.call(patch, 'percentOff') && patch.percentOff != null)) {
    $unset.fixedOff = '';
  }
  if ($set.type === 'fixed' || (Object.prototype.hasOwnProperty.call(patch, 'fixedOff') && patch.fixedOff != null)) {
    $unset.percentOff = '';
  }

  const mongo: any = {};
  if (Object.keys($set).length) mongo.$set = $set;
  if (Object.keys($unset).length) mongo.$unset = $unset;

  if (Object.keys(mongo).length === 0) {
    const unchanged = await CouponModel.findById(id);
    if (!unchanged) throw new AppError('Coupon not found', 404, 'not_found');
    return unchanged;
  }

  const doc = await CouponModel.findByIdAndUpdate(id, mongo, { new: true });
  if (!doc) throw new AppError('Coupon not found', 404, 'not_found');
  return doc;
}

export async function deleteCoupon(id: string) {
  const doc = await CouponModel.findByIdAndDelete(id);
  if (!doc) throw new AppError('Coupon not found', 404, 'not_found');
}

export async function getCouponById(id: string) {
  const doc = await CouponModel.findById(id);
  if (!doc) throw new AppError('Coupon not found', 404, 'not_found');
  return doc.toJSON();
}

/** ---------- Offers ---------- */
function normalizeOfferLean(raw: any) {
  const ids: string[] = [];
  if (Array.isArray(raw.targetIds)) {
    for (const x of raw.targetIds) ids.push(String(x));
  }
  if (ids.length === 0 && raw.targetId) ids.push(String(raw.targetId));
  const { targetId, _id, __v, ...rest } = raw;
  return {
    ...rest,
    id: _id?.toString?.() ?? String(_id),
    targetIds: ids,
  };
}

export async function listOffersAdmin() {
  const rows = await OfferModel.find({}).sort({ createdAt: -1 }).lean();
  return rows.map((r) => normalizeOfferLean(r as any));
}

export async function createOffer(input: {
  name: string;
  targetType: 'product' | 'collection' | 'category';
  targetIds: string[];
  percentOff?: number;
  fixedOff?: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive?: boolean;
}) {
  ensureOfferPricing(input.percentOff, input.fixedOff);
  return OfferModel.create({
    name: input.name,
    targetType: input.targetType,
    targetIds: input.targetIds.map((x) => new Types.ObjectId(x)),
    percentOff: input.percentOff,
    fixedOff: input.fixedOff,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    isActive: input.isActive ?? true,
  });
}

export async function updateOffer(
  id: string,
  patch: Partial<{
    name: string;
    targetType: 'product' | 'collection' | 'category';
    targetIds: string[];
    percentOff: number;
    fixedOff: number;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
  }>
) {
  const cur = await OfferModel.findById(id).lean();
  if (!cur) throw new AppError('Offer not found', 404, 'not_found');
  const c = cur as any;

  if ('percentOff' in patch || 'fixedOff' in patch) {
    const nextP = 'percentOff' in patch ? patch.percentOff : c.percentOff;
    const nextF = 'fixedOff' in patch ? patch.fixedOff : c.fixedOff;
    ensureOfferPricing(nextP, nextF);
  }

  const $set: Record<string, unknown> = {};
  if (patch.name !== undefined) $set.name = patch.name;
  if (patch.targetType !== undefined) $set.targetType = patch.targetType;
  if (patch.targetIds !== undefined) {
    $set.targetIds = patch.targetIds.map((x) => new Types.ObjectId(x));
  }
  if (patch.startsAt !== undefined) $set.startsAt = patch.startsAt;
  if (patch.endsAt !== undefined) $set.endsAt = patch.endsAt;
  if (patch.isActive !== undefined) $set.isActive = patch.isActive;

  const $unset: Record<string, ''> = {};
  if ('percentOff' in patch) {
    $set.percentOff = patch.percentOff;
    if (patch.percentOff != null) $unset.fixedOff = '';
  }
  if ('fixedOff' in patch) {
    $set.fixedOff = patch.fixedOff;
    if (patch.fixedOff != null) $unset.percentOff = '';
  }

  const mongo: Record<string, unknown> = {};
  if (Object.keys($set).length) mongo.$set = $set;
  if (Object.keys($unset).length) mongo.$unset = $unset;

  if (Object.keys(mongo).length === 0) {
    const unchanged = await OfferModel.findById(id);
    if (!unchanged) throw new AppError('Offer not found', 404, 'not_found');
    return unchanged;
  }

  const doc = await OfferModel.findByIdAndUpdate(id, mongo, { new: true });
  if (!doc) throw new AppError('Offer not found', 404, 'not_found');
  return doc;
}

export async function deleteOffer(id: string) {
  const doc = await OfferModel.findByIdAndDelete(id);
  if (!doc) throw new AppError('Offer not found', 404, 'not_found');
}

/** ---------- Campaigns ---------- */
export async function listCampaignsAdmin() {
  return CampaignModel.find({}).sort({ createdAt: -1 }).lean();
}

export async function createCampaign(input: {
  name: string;
  slug: string;
  description?: string;
  couponIds?: string[];
  offerIds?: string[];
  startsAt?: Date;
  endsAt?: Date;
  isActive?: boolean;
}) {
  return CampaignModel.create({
    name: input.name,
    slug: input.slug.toLowerCase(),
    description: input.description ?? '',
    couponIds: (input.couponIds ?? []).map((id) => new Types.ObjectId(id)),
    offerIds: (input.offerIds ?? []).map((id) => new Types.ObjectId(id)),
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    isActive: input.isActive ?? true,
  });
}

export async function updateCampaign(
  id: string,
  patch: Partial<{
    name: string;
    slug: string;
    description: string;
    couponIds: string[];
    offerIds: string[];
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
  }>
) {
  const update: any = { ...patch };
  if (typeof update.slug === 'string') update.slug = update.slug.toLowerCase();
  if (Array.isArray(update.couponIds)) {
    update.couponIds = update.couponIds.map((x: string) => new Types.ObjectId(x));
  }
  if (Array.isArray(update.offerIds)) {
    update.offerIds = update.offerIds.map((x: string) => new Types.ObjectId(x));
  }

  const doc = await CampaignModel.findByIdAndUpdate(id, update, { new: true });
  if (!doc) throw new AppError('Campaign not found', 404, 'not_found');
  return doc;
}

export async function deleteCampaign(id: string) {
  const doc = await CampaignModel.findByIdAndDelete(id);
  if (!doc) throw new AppError('Campaign not found', 404, 'not_found');
}

/** ---------- Abandoned carts ---------- */
export async function upsertAbandonedCart(input: {
  sessionKey: string;
  customerId?: string;
  currencyCode?: string;
  items: Array<{
    productId: string;
    quantity: number;
    selections?: Array<{ optionId: string; valueKeys: string[] }>;
  }>;
}) {
  const items = input.items.map((i) => ({
    productId: new Types.ObjectId(i.productId),
    quantity: i.quantity,
    selections: (i.selections ?? []).map((s) => ({
      optionId: new Types.ObjectId(s.optionId),
      valueKeys: s.valueKeys ?? [],
    })),
  }));

  await AbandonedCartModel.findOneAndUpdate(
    { sessionKey: input.sessionKey },
    {
      $set: {
        customerId: input.customerId ? new Types.ObjectId(input.customerId) : undefined,
        items,
        currencyCode: input.currencyCode?.trim() || 'USD',
      },
    },
    { upsert: true, new: true }
  );
}

export async function listAbandonedCartsAdmin() {
  return AbandonedCartModel.find({}).sort({ updatedAt: -1 }).limit(300).lean();
}

export async function getAbandonedCartAdmin(id: string) {
  const doc = await AbandonedCartModel.findById(id).lean();
  if (!doc) throw new AppError('Cart not found', 404, 'not_found');
  const o: any = { ...(doc as any) };
  o.id = (doc as any)._id.toString();
  delete o._id;
  delete o.__v;
  return o;
}

export async function touchCartReminder(id: string) {
  const doc = await AbandonedCartModel.findByIdAndUpdate(
    id,
    {
      $set: { lastReminderAt: new Date() },
      $inc: { remindersSent: 1 },
    },
    { new: true }
  );
  if (!doc) throw new AppError('Cart not found', 404, 'not_found');
  return doc;
}
