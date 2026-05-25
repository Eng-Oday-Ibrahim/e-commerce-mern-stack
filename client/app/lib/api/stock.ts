import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "./types";

export type StockDto = {
  id: string;
  productId: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  createdAt: string;
  updatedAt: string;
};

export type StockListItemDto = {
  product: { id: string; slug: string; name: { ar: string; en: string }; isActive: boolean };
  stock: StockDto;
};

export const StockApi = {
  getPublicByProductId: async (productId: string) => {
    const res = await api.get<ApiOkResponse<{ stock: { productId: string; availableQty: number } }>>(
      `/api/stock/public/products/${productId}`
    );
    return res.data;
  },
  listAll: async () => {
    const res = await api.get<ApiOkResponse<{ items: StockListItemDto[] }>>(
      "/api/stock/all"
    );
    return res.data;
  },

  getByProductId: async (productId: string) => {
    const res = await api.get<ApiOkResponse<{ stock: StockDto }>>(
      `/api/stock/products/${productId}`
    );
    return res.data;
  },

  setOnHand: async (productId: string, onHandQty: number) => {
    const res = await api.put<ApiOkResponse<{ stock: StockDto }>>(
      `/api/stock/products/${productId}`,
      { onHandQty }
    );
    return res.data;
  },

  adjustOnHand: async (productId: string, delta: number, reason?: string) => {
    const res = await api.post<ApiOkResponse<{ stock: StockDto }>>(
      `/api/stock/products/${productId}/adjust`,
      { delta, reason }
    );
    return res.data;
  },
};
