export type LocalizedString = { ar: string; en: string };

export type CategoryDto = {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrl?: string;
  parentCategoryId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CollectionDto = {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  productIds: string[];
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type OptionDto = {
  id: string;
  slug: string;
  name: LocalizedString;
  type: "text" | "color";
  values: Array<{ key: string; value?: string; hex?: string }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductDto = {
  id: string;
  slug: string;
  sku?: string;
  name: LocalizedString;
  description: LocalizedString;
  /** Major currency units (e.g. 12.99). */
  price: number;
  originalPrice?: number;
  hasOffer?: boolean;
  offerLabel?: string;
  offerBadge?: string;
  categoryIds: string[];
  optionIds: string[];
  options: Array<{ optionId: string; valueKeys: string[] }>;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  inStock?: boolean;
  avgRating?: number;
  reviewCount?: number;
  collectionIds?: string[];
  createdAt: string;
  updatedAt: string;
};
