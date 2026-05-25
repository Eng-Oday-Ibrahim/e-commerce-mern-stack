import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "@/api/types";
import type { LocalizedString, OptionDto, ProductDto } from "./types";

export const ProductApi = {
  listPublic: async () => {
    const res = await api.get<ApiOkResponse<{ products: ProductDto[] }>>(
      "/api/catalog/products"
    );
    return res.data;
  },

  getStoreDetail: async (id: string) => {
    const res = await api.get<
      ApiOkResponse<{ product: ProductDto; options: OptionDto[] }>
    >(`/api/catalog/products/detail/${id}`);
    return res.data;
  },

  getStoreDetailBySlug: async (slug: string) => {
    const res = await api.get<ApiOkResponse<{ product: ProductDto; options: OptionDto[] }>>(
      `/api/catalog/products/detail-by-slug/${slug}`
    );
    return res.data;
  },

  listAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ products: ProductDto[] }>>(
      "/api/catalog/products/all"
    );
    return res.data;
  },

  getAdminById: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ product: ProductDto }>>(
      `/api/catalog/products/admin/${id}`
    );
    return res.data;
  },

  create: async (input: {
    name: LocalizedString;
    description?: LocalizedString;
    price: number;
    categoryIds?: string[];
    optionIds?: string[];
    options?: Array<{ optionId: string; valueKeys: string[] }>;
    images?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
  }) => {
    const res = await api.post<ApiOkResponse<{ product: ProductDto }>>(
      "/api/catalog/products",
      input
    );
    return res.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/catalog/products/${id}`);
  },

  update: async (id: string, input: Partial<{
    name: LocalizedString;
    description: LocalizedString;
    price: number;
    categoryIds: string[];
    optionIds: string[];
    options: Array<{ optionId: string; valueKeys: string[] }>;
    images: string[];
    isActive: boolean;
    isFeatured: boolean;
  }>) => {
    const res = await api.patch<ApiOkResponse<{ product: ProductDto }>>(
      `/api/catalog/products/${id}`,
      input
    );
    return res.data;
  },
};
