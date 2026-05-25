import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "@/api/types";
import type { LocalizedString, OptionDto } from "./types";

export const OptionApi = {
  listPublic: async () => {
    const res = await api.get<ApiOkResponse<{ options: OptionDto[] }>>(
      "/api/catalog/options"
    );
    return res.data;
  },

  listAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ options: OptionDto[] }>>(
      "/api/catalog/options/all"
    );
    return res.data;
  },

  getAdminById: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ option: OptionDto }>>(
      `/api/catalog/options/admin/${id}`
    );
    return res.data;
  },

  create: async (input: {
    slug: string;
    name: LocalizedString;
    type?: "text" | "color";
    values?: Array<{ key?: string; value?: string; hex?: string }>;
    isActive?: boolean;
  }) => {
    const res = await api.post<ApiOkResponse<{ option: OptionDto }>>(
      "/api/catalog/options",
      input
    );
    return res.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/catalog/options/${id}`);
  },

  update: async (id: string, input: Partial<{
    slug: string;
    name: LocalizedString;
    type: "text" | "color";
    values: Array<{ key?: string; value?: string; hex?: string }>;
    isActive: boolean;
  }>) => {
    const res = await api.patch<ApiOkResponse<{ option: OptionDto }>>(
      `/api/catalog/options/${id}`,
      input
    );
    return res.data;
  },
};
