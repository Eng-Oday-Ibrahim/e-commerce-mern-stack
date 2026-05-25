import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "@/api/types";
import type { LocalizedString, ProductDto } from "@/lib/api/catalog/types";

export type AnnouncementDto = {
  id?: string;
  _id?: string;
  message: { ar: string; en: string };
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  sortOrder?: number;
};

export type CouponDto = {
  id?: string;
  code: string;
  type: "percent" | "fixed";
  percentOff?: number;
  fixedOff?: number;
  minSubtotal?: number;
  maxRedemptions?: number | null;
  redemptionsCount?: number;
  perCustomerMax?: number;
  currencyCode?: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

export type OfferDto = {
  id?: string;
  name: string;
  targetType: "product" | "collection" | "category";
  targetIds: string[];
  percentOff?: number;
  fixedOff?: number;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

export type CampaignDto = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  couponIds?: string[];
  offerIds?: string[];
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

export type AbandonedCartDto = {
  id?: string;
  sessionKey: string;
  items: unknown[];
  currencyCode?: string;
  remindersSent?: number;
  updatedAt?: string;
};

export type LookbookDto = {
  id?: string;
  title: LocalizedString;
  slug: string;
  description: LocalizedString;
  coverImage?: string;
  published?: boolean;
  linkedProductId?: string | null;
  products?: ProductDto[];
  createdAt?: string;
  updatedAt?: string;
};

export type LookbookHotspotDto = {
  x: number;
  y: number;
  productId: string;
};

export type LookbookItemDto = {
  id?: string;
  lookbookId: string;
  image: string;
  caption?: LocalizedString;
  sortOrder?: number;
  linkedProducts?: Array<string | ProductDto>;
  hotspots?: LookbookHotspotDto[];
  createdAt?: string;
};

export type HeroSlideDto = {
  id?: string;
  eyebrow: LocalizedString;
  line1: LocalizedString;
  line2: LocalizedString;
  sub: LocalizedString;
  cta: LocalizedString;
  ctaHref: string;
  image: string;
  published?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const MarketingApi = {
  announcementsActive: async () => {
    const res = await api.get<ApiOkResponse<{ announcements: AnnouncementDto[] }>>(
      "/api/marketing/announcements/active"
    );
    return res.data;
  },

  announcementsList: async () => {
    const res = await api.get<ApiOkResponse<{ announcements: AnnouncementDto[] }>>(
      "/api/marketing/announcements"
    );
    return res.data;
  },

  announcementsCreate: async (body: {
    message: { ar: string; en: string };
    isActive?: boolean;
    startsAt?: string;
    endsAt?: string;
    sortOrder?: number;
  }) => {
    const res = await api.post<ApiOkResponse<{ announcement: AnnouncementDto }>>(
      "/api/marketing/announcements",
      body
    );
    return res.data;
  },

  announcementsPatch: async (id: string, body: Partial<AnnouncementDto>) => {
    const res = await api.patch<ApiOkResponse<{ announcement: AnnouncementDto }>>(
      `/api/marketing/announcements/${id}`,
      body
    );
    return res.data;
  },

  announcementsDelete: async (id: string) => {
    await api.delete(`/api/marketing/announcements/${id}`);
  },

  couponsList: async () => {
    const res = await api.get<ApiOkResponse<{ coupons: CouponDto[] }>>("/api/marketing/coupons");
    return res.data;
  },

  couponsGet: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ coupon: CouponDto }>>(`/api/marketing/coupons/${id}`);
    return res.data;
  },

  couponsCreate: async (body: CouponDto & Record<string, unknown>) => {
    const res = await api.post<ApiOkResponse<{ coupon: CouponDto }>>("/api/marketing/coupons", body);
    return res.data;
  },

  couponsPatch: async (id: string, body: Partial<CouponDto>) => {
    const res = await api.patch<ApiOkResponse<{ coupon: CouponDto }>>(
      `/api/marketing/coupons/${id}`,
      body
    );
    return res.data;
  },

  couponsDelete: async (id: string) => {
    await api.delete(`/api/marketing/coupons/${id}`);
  },

  offersList: async () => {
    const res = await api.get<ApiOkResponse<{ offers: OfferDto[] }>>("/api/marketing/offers");
    return res.data;
  },

  offersCreate: async (body: OfferDto & Record<string, unknown>) => {
    const res = await api.post<ApiOkResponse<{ offer: OfferDto }>>("/api/marketing/offers", body);
    return res.data;
  },

  offersPatch: async (id: string, body: Partial<OfferDto>) => {
    const res = await api.patch<ApiOkResponse<{ offer: OfferDto }>>(
      `/api/marketing/offers/${id}`,
      body
    );
    return res.data;
  },

  offersDelete: async (id: string) => {
    await api.delete(`/api/marketing/offers/${id}`);
  },

  campaignsList: async () => {
    const res = await api.get<ApiOkResponse<{ campaigns: CampaignDto[] }>>("/api/marketing/campaigns");
    return res.data;
  },

  campaignsCreate: async (body: CampaignDto & Record<string, unknown>) => {
    const res = await api.post<ApiOkResponse<{ campaign: CampaignDto }>>(
      "/api/marketing/campaigns",
      body
    );
    return res.data;
  },

  campaignsPatch: async (id: string, body: Partial<CampaignDto>) => {
    const res = await api.patch<ApiOkResponse<{ campaign: CampaignDto }>>(
      `/api/marketing/campaigns/${id}`,
      body
    );
    return res.data;
  },

  campaignsDelete: async (id: string) => {
    await api.delete(`/api/marketing/campaigns/${id}`);
  },

  cartsTrack: async (body: {
    sessionKey: string;
    customerId?: string;
    currencyCode?: string;
    items: Array<{
      productId: string;
      quantity: number;
      selections?: Array<{ optionId: string; valueKeys: string[] }>;
    }>;
  }) => {
    await api.post("/api/marketing/carts/track", body);
  },

  abandonedCartsList: async () => {
    const res = await api.get<ApiOkResponse<{ carts: AbandonedCartDto[] }>>(
      "/api/marketing/abandoned-carts"
    );
    return res.data;
  },

  abandonedCartGet: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ cart: AbandonedCartDto }>>(
      `/api/marketing/abandoned-carts/${id}`
    );
    return res.data;
  },

  abandonedCartRemind: async (id: string) => {
    const res = await api.post<ApiOkResponse<{ cart: AbandonedCartDto }>>(
      `/api/marketing/abandoned-carts/${id}/remind`
    );
    return res.data;
  },

  heroSlidesListPublic: async () => {
    const res = await api.get<ApiOkResponse<{ heroSlides: HeroSlideDto[] }>>(
      "/api/marketing/hero-slides/public"
    );
    return res.data;
  },

  heroSlidesListAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ heroSlides: HeroSlideDto[] }>>(
      "/api/marketing/hero-slides"
    );
    return res.data;
  },

  heroSlidesGetAdmin: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ heroSlide: HeroSlideDto }>>(
      `/api/marketing/hero-slides/${id}`
    );
    return res.data;
  },

  heroSlidesCreate: async (body: {
    eyebrow: LocalizedString;
    line1: LocalizedString;
    line2: LocalizedString;
    sub: LocalizedString;
    cta: LocalizedString;
    ctaHref: string;
    image: string;
    published?: boolean;
  }) => {
    const res = await api.post<ApiOkResponse<{ heroSlide: HeroSlideDto }>>(
      "/api/marketing/hero-slides",
      body
    );
    return res.data;
  },

  heroSlidesPatch: async (id: string, body: Partial<HeroSlideDto>) => {
    const res = await api.patch<ApiOkResponse<{ heroSlide: HeroSlideDto }>>(
      `/api/marketing/hero-slides/${id}`,
      body
    );
    return res.data;
  },

  heroSlidesDelete: async (id: string) => {
    await api.delete(`/api/marketing/hero-slides/${id}`);
  },

  lookbooksListPublic: async () => {
    const res = await api.get<ApiOkResponse<{ lookbooks: LookbookDto[] }>>(
      "/api/marketing/lookbooks/public"
    );
    return res.data;
  },

  lookbooksGetPublicBySlug: async (slug: string) => {
    const res = await api.get<ApiOkResponse<{ lookbook: LookbookDto; items: LookbookItemDto[] }>>(
      `/api/marketing/lookbooks/public/${slug}`
    );
    return res.data;
  },

  lookbooksListAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ lookbooks: LookbookDto[] }>>("/api/marketing/lookbooks");
    return res.data;
  },

  lookbooksGetAdmin: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ lookbook: LookbookDto }>>(`/api/marketing/lookbooks/${id}`);
    return res.data;
  },

  lookbooksCreate: async (body: {
    title: LocalizedString;
    description: LocalizedString;
    coverImage?: string;
    published?: boolean;
  } & Record<string, unknown>) => {
    const res = await api.post<ApiOkResponse<{ lookbook: LookbookDto }>>("/api/marketing/lookbooks", body);
    return res.data;
  },

  lookbooksPatch: async (id: string, body: Partial<LookbookDto>) => {
    const res = await api.patch<ApiOkResponse<{ lookbook: LookbookDto }>>(
      `/api/marketing/lookbooks/${id}`,
      body
    );
    return res.data;
  },

  lookbooksDelete: async (id: string) => {
    await api.delete(`/api/marketing/lookbooks/${id}`);
  },

  lookbookItemsListAdmin: async (lookbookId: string) => {
    const res = await api.get<ApiOkResponse<{ items: LookbookItemDto[] }>>(
      `/api/marketing/lookbooks/${lookbookId}/items`
    );
    return res.data;
  },

  lookbookItemsBulkCreateAdmin: async (
    lookbookId: string,
    body: { items: Array<Pick<LookbookItemDto, "image" | "caption" | "sortOrder" | "hotspots"> & { linkedProducts?: string[] }> }
  ) => {
    const res = await api.post<ApiOkResponse<{ items: LookbookItemDto[] }>>(
      `/api/marketing/lookbooks/${lookbookId}/items/bulk`,
      body
    );
    return res.data;
  },

  lookbookItemsPatchAdmin: async (lookbookId: string, itemId: string, body: Partial<LookbookItemDto>) => {
    const res = await api.patch<ApiOkResponse<{ item: LookbookItemDto }>>(
      `/api/marketing/lookbooks/${lookbookId}/items/${itemId}`,
      body
    );
    return res.data;
  },

  lookbookItemsDeleteAdmin: async (lookbookId: string, itemId: string) => {
    await api.delete(`/api/marketing/lookbooks/${lookbookId}/items/${itemId}`);
  },

  lookbookItemsReorderAdmin: async (lookbookId: string, body: { items: Array<{ id: string; sortOrder: number }> }) => {
    await api.post(`/api/marketing/lookbooks/${lookbookId}/items/reorder`, body);
  },
};
