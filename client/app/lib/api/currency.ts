import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "./types";

export type CurrencyDto = {
  id: string;
  code: string;
  name: string;
  symbol?: string;
  decimals: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export const CurrencyApi = {
  getPublicDefault: async () => {
    const res = await api.get<ApiOkResponse<{ currency: CurrencyDto }>>("/api/currencies/public/default");
    return res.data;
  },

  listAll: async () => {
    const res = await api.get<ApiOkResponse<{ currencies: CurrencyDto[] }>>("/api/currencies");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ currency: CurrencyDto }>>(`/api/currencies/${id}`);
    return res.data;
  },

  create: async (input: {
    code: string;
    name: string;
    symbol?: string;
    decimals?: number;
    isDefault?: boolean;
    isActive?: boolean;
    sortOrder?: number;
  }) => {
    const res = await api.post<ApiOkResponse<{ currency: CurrencyDto }>>("/api/currencies", input);
    return res.data;
  },

  update: async (
    id: string,
    input: Partial<{
      code: string;
      name: string;
      symbol: string | null;
      decimals: number;
      isDefault: boolean;
      isActive: boolean;
      sortOrder: number;
    }>
  ) => {
    const res = await api.patch<ApiOkResponse<{ currency: CurrencyDto }>>(`/api/currencies/${id}`, input);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiOkResponse<Record<string, never>>>(`/api/currencies/${id}`);
    return res.data;
  },
};
