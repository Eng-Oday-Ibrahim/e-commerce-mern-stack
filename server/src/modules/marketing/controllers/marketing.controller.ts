import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import {
  AnnouncementCreateSchema,
  CampaignCreateSchema,
  CartTrackSchema,
  CouponCreateSchema,
  OfferCreateSchema,
} from '../validators/marketing.validator';
import * as Crud from '../services/marketing.crud.service';
import {
  LookbookCreateSchema,
  LookbookItemPatchSchema,
  LookbookItemsBulkCreateSchema,
  LookbookItemsReorderSchema,
} from '../validators/lookbook.validator';
import { HeroSlideCreateSchema, HeroSlidePatchSchema } from '../validators/heroSlide.validator';
import * as Lookbooks from '../services/lookbook.service';
import * as HeroSlides from '../services/heroSlide.service';

export const announcementsActive = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await Crud.listAnnouncementsActivePublic();
  res.json({ ok: true, announcements: rows });
});

export const announcementsList = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await Crud.listAnnouncementsAdmin();
  res.json({ ok: true, announcements: rows });
});

export const announcementsCreate = asyncHandler(async (req: Request, res: Response) => {
  const body = AnnouncementCreateSchema.parse(req.body);
  const doc = await Crud.createAnnouncement(body);
  res.status(201).json({ ok: true, announcement: doc.toJSON() });
});

export const announcementsPatch = asyncHandler(async (req: Request, res: Response) => {
  const body = AnnouncementCreateSchema.partial().parse(req.body);
  const doc = await Crud.updateAnnouncement(req.params.id as string, body as any);
  res.json({ ok: true, announcement: doc.toJSON() });
});

export const announcementsDelete = asyncHandler(async (req: Request, res: Response) => {
  await Crud.deleteAnnouncement(req.params.id as string);
  res.json({ ok: true });
});

export const couponsList = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await Crud.listCouponsAdmin();
  res.json({ ok: true, coupons: rows });
});

export const couponsCreate = asyncHandler(async (req: Request, res: Response) => {
  const body = CouponCreateSchema.parse(req.body);
  const doc = await Crud.createCoupon(body as any);
  res.status(201).json({ ok: true, coupon: doc.toJSON() });
});

export const couponsPatch = asyncHandler(async (req: Request, res: Response) => {
  const body = CouponCreateSchema.partial().parse(req.body);
  const doc = await Crud.updateCoupon(req.params.id as string, body as any);
  res.json({ ok: true, coupon: doc.toJSON() });
});

export const couponsDelete = asyncHandler(async (req: Request, res: Response) => {
  await Crud.deleteCoupon(req.params.id as string);
  res.json({ ok: true });
});

export const couponsGetOne = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Crud.getCouponById(req.params.id as string);
  res.json({ ok: true, coupon });
});

export const offersList = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await Crud.listOffersAdmin();
  res.json({ ok: true, offers: rows });
});

export const offersCreate = asyncHandler(async (req: Request, res: Response) => {
  const body = OfferCreateSchema.parse(req.body);
  const doc = await Crud.createOffer(body as any);
  res.status(201).json({ ok: true, offer: doc.toJSON() });
});

export const offersPatch = asyncHandler(async (req: Request, res: Response) => {
  const body = OfferCreateSchema.partial().parse(req.body);
  const doc = await Crud.updateOffer(req.params.id as string, body as any);
  res.json({ ok: true, offer: doc.toJSON() });
});

export const offersDelete = asyncHandler(async (req: Request, res: Response) => {
  await Crud.deleteOffer(req.params.id as string);
  res.json({ ok: true });
});

export const campaignsList = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await Crud.listCampaignsAdmin();
  res.json({ ok: true, campaigns: rows });
});

export const campaignsCreate = asyncHandler(async (req: Request, res: Response) => {
  const body = CampaignCreateSchema.parse(req.body);
  const doc = await Crud.createCampaign(body as any);
  res.status(201).json({ ok: true, campaign: doc.toJSON() });
});

export const campaignsPatch = asyncHandler(async (req: Request, res: Response) => {
  const body = CampaignCreateSchema.partial().parse(req.body);
  const doc = await Crud.updateCampaign(req.params.id as string, body as any);
  res.json({ ok: true, campaign: doc.toJSON() });
});

export const campaignsDelete = asyncHandler(async (req: Request, res: Response) => {
  await Crud.deleteCampaign(req.params.id as string);
  res.json({ ok: true });
});

export const cartTrack = asyncHandler(async (req: Request, res: Response) => {
  const body = CartTrackSchema.parse(req.body);
  await Crud.upsertAbandonedCart(body as any);
  res.json({ ok: true });
});

export const cartsListAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await Crud.listAbandonedCartsAdmin();
  res.json({ ok: true, carts: rows });
});

export const cartsGetOneAdmin = asyncHandler(async (req: Request, res: Response) => {
  const cart = await Crud.getAbandonedCartAdmin(req.params.id as string);
  res.json({ ok: true, cart });
});

export const cartRemindAdmin = asyncHandler(async (req: Request, res: Response) => {
  const doc = await Crud.touchCartReminder(req.params.id as string);
  res.json({ ok: true, cart: doc.toJSON() });
});

export const lookbooksListAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const lookbooks = await Lookbooks.listLookbooksAdmin();
  res.json({ ok: true, lookbooks });
});

export const lookbooksCreate = asyncHandler(async (req: Request, res: Response) => {
  const body = LookbookCreateSchema.parse(req.body);
  const doc = await Lookbooks.createLookbook(body);
  res.status(201).json({ ok: true, lookbook: doc.toJSON() });
});

export const lookbooksGetOneAdmin = asyncHandler(async (req: Request, res: Response) => {
  const doc = await Lookbooks.getLookbookAdmin(req.params.id as string);
  res.json({ ok: true, lookbook: doc.toJSON() });
});

export const lookbooksPatch = asyncHandler(async (req: Request, res: Response) => {
  const body = LookbookCreateSchema.partial().parse(req.body);
  const doc = await Lookbooks.patchLookbook(req.params.id as string, body as any);
  res.json({ ok: true, lookbook: doc.toJSON() });
});

export const lookbooksDelete = asyncHandler(async (req: Request, res: Response) => {
  await Lookbooks.deleteLookbook(req.params.id as string);
  res.json({ ok: true });
});

export const heroSlidesListAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const heroSlides = await HeroSlides.listHeroSlidesAdmin();
  res.json({ ok: true, heroSlides });
});

export const heroSlidesCreate = asyncHandler(async (req: Request, res: Response) => {
  const body = HeroSlideCreateSchema.parse(req.body);
  const doc = await HeroSlides.createHeroSlide(body);
  res.status(201).json({ ok: true, heroSlide: doc.toJSON() });
});

export const heroSlidesGetOneAdmin = asyncHandler(async (req: Request, res: Response) => {
  const doc = await HeroSlides.getHeroSlideAdmin(req.params.id as string);
  res.json({ ok: true, heroSlide: doc.toJSON() });
});

export const heroSlidesPatch = asyncHandler(async (req: Request, res: Response) => {
  const body = HeroSlidePatchSchema.parse(req.body);
  const doc = await HeroSlides.patchHeroSlide(req.params.id as string, body as any);
  res.json({ ok: true, heroSlide: doc.toJSON() });
});

export const heroSlidesDelete = asyncHandler(async (req: Request, res: Response) => {
  await HeroSlides.deleteHeroSlide(req.params.id as string);
  res.json({ ok: true });
});

export const heroSlidesListPublic = asyncHandler(async (_req: Request, res: Response) => {
  const heroSlides = await HeroSlides.listHeroSlidesPublic();
  res.json({ ok: true, heroSlides });
});

export const lookbooksListPublic = asyncHandler(async (_req: Request, res: Response) => {
  const lookbooks = await Lookbooks.listLookbooksPublic();
  res.json({ ok: true, lookbooks });
});

export const lookbooksGetBySlugPublic = asyncHandler(async (req: Request, res: Response) => {
  const result = await Lookbooks.getLookbookPublicBySlug(req.params.slug as string);
  res.json({ ok: true, ...result });
});

export const lookbookItemsListAdmin = asyncHandler(async (req: Request, res: Response) => {
  const items = await Lookbooks.listLookbookItemsAdmin(req.params.id as string);
  res.json({ ok: true, items });
});

export const lookbookItemsBulkCreateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const body = LookbookItemsBulkCreateSchema.parse(req.body);
  const items = await Lookbooks.createLookbookItemsBulk(req.params.id as string, body.items);
  res.status(201).json({ ok: true, items });
});

export const lookbookItemsPatchAdmin = asyncHandler(async (req: Request, res: Response) => {
  const body = LookbookItemPatchSchema.parse(req.body);
  const doc = await Lookbooks.patchLookbookItem(
    req.params.id as string,
    req.params.itemId as string,
    body as any
  );
  res.json({ ok: true, item: doc.toJSON() });
});

export const lookbookItemsDeleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  await Lookbooks.deleteLookbookItem(req.params.id as string, req.params.itemId as string);
  res.json({ ok: true });
});

export const lookbookItemsReorderAdmin = asyncHandler(async (req: Request, res: Response) => {
  const body = LookbookItemsReorderSchema.parse(req.body);
  await Lookbooks.reorderLookbookItems(req.params.id as string, body.items);
  res.json({ ok: true });
});
