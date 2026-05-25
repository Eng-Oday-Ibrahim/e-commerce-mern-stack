import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "@/api/types";
import type { CollectionDto, LocalizedString } from "./types";

export const CollectionApi = {
  listPublic: async () => {
    const res = await api.get<ApiOkResponse<{ collections: CollectionDto[] }>>(
      "/api/catalog/collections"
    );
    return res.data;
  },

  listAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ collections: CollectionDto[] }>>(
      "/api/catalog/collections/all"
    );
    return res.data;
  },

  getAdminById: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ collection: CollectionDto }>>(
      `/api/catalog/collections/admin/${id}`
    );
    return res.data;
  },

  create: async (input: {
    name: LocalizedString;
    description?: LocalizedString;
    productIds?: string[];
    imageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) => {
    const res = await api.post<ApiOkResponse<{ collection: CollectionDto }>>(
      "/api/catalog/collections",
      input
    );
    return res.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/catalog/collections/${id}`);
  },

  update: async (id: string, input: Partial<{
    name: LocalizedString;
    description: LocalizedString;
    productIds: string[];
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
  }>) => {
    const res = await api.patch<ApiOkResponse<{ collection: CollectionDto }>>(
      `/api/catalog/collections/${id}`,
      input
    );
    return res.data;
  },
};
