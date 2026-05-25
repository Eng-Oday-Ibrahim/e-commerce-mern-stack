import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "@/api/types";
import type { CategoryDto, LocalizedString } from "./types";

export const CategoryApi = {
  listPublic: async () => {
    const res = await api.get<ApiOkResponse<{ categories: CategoryDto[] }>>(
      "/api/catalog/categories"
    );
    return res.data;
  },

  listAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ categories: CategoryDto[] }>>(
      "/api/catalog/categories/all"
    );
    return res.data;
  },

  getAdminById: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ category: CategoryDto }>>(
      `/api/catalog/categories/admin/${id}`
    );
    return res.data;
  },

  create: async (input: {
    name: LocalizedString;
    description?: LocalizedString;
    imageUrl?: string;
    parentCategoryId?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) => {
    const res = await api.post<ApiOkResponse<{ category: CategoryDto }>>(
      "/api/catalog/categories",
      input
    );
    return res.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/catalog/categories/${id}`);
  },

  update: async (id: string, input: Partial<{
    name: LocalizedString;
    description: LocalizedString;
    imageUrl: string | null;
    parentCategoryId: string | null;
    isActive: boolean;
    sortOrder: number;
  }>) => {
    const res = await api.patch<ApiOkResponse<{ category: CategoryDto }>>(
      `/api/catalog/categories/${id}`,
      input
    );
    return res.data;
  },
};
