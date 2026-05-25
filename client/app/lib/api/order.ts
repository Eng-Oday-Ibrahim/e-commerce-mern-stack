import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "./types";

export type OrderDto = {
  id: string;
  orderNumber: number;
  status: "pending" | "confirmed" | "processing" | "completed" | "canceled" | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  shippingStatus: "pending" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "returned";
  currencyCode: string;
  subtotal: number;
  discount?: number;
  shippingFee: number;
  taxLabel?: string;
  taxAmount?: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

export const OrderApi = {
  listAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ orders: OrderDto[] }>>("/api/orders");
    return res.data;
  },

  getAdminById: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ order: OrderDto }>>(`/api/orders/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: OrderDto["status"]) => {
    const res = await api.patch<ApiOkResponse<{ order: OrderDto }>>(`/api/orders/${id}/status`, {
      status,
    });
    return res.data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: OrderDto["paymentStatus"]) => {
    const res = await api.patch<ApiOkResponse<{ order: OrderDto }>>(`/api/orders/${id}/payment-status`, {
      paymentStatus,
    });
    return res.data;
  },

  updateShippingStatus: async (id: string, shippingStatus: OrderDto["shippingStatus"]) => {
    const res = await api.patch<ApiOkResponse<{ order: OrderDto }>>(`/api/orders/${id}/shipping-status`, {
      shippingStatus,
    });
    return res.data;
  },

  listMine: async () => {
    const res = await api.get<ApiOkResponse<{ orders: OrderDto[] }>>("/api/orders/mine");
    return res.data;
  },

  getMineById: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ order: OrderDto }>>(`/api/orders/mine/${id}`);
    return res.data;
  },

  getPublicById: async (id: string, accessToken: string) => {
    const res = await api.get<ApiOkResponse<{ order: OrderDto }>>(
      `/api/orders/public/${id}`,
      { params: { accessToken } }
    );
    return res.data;
  },

  trackOrder: async (orderNumber: number | string, phone?: string) => {
    const res = await api.get<ApiOkResponse<{ order: OrderDto }>>(
      "/api/orders/track",
      { params: { orderNumber, ...(phone ? { phone } : {}) } }
    );
    return res.data;
  },

  searchByPhone: async (phone: string) => {
    const res = await api.get<ApiOkResponse<{ orders: OrderDto[] }>>(
      `/api/orders/phone/${encodeURIComponent(phone)}`
    );
    return res.data;
  },

  create: async (input: {
    items: Array<{
      productId: string;
      quantity: number;
      selections?: Array<{ optionId: string; valueKeys: string[] }>;
    }>;
    shippingMethodId: string;
    shippingAddress: {
      fullName: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      country: string;
      postalCode?: string;
    };
    couponCode?: string;
  }) => {
    const res = await api.post<ApiOkResponse<{ order: OrderDto; accessToken: string }>>("/api/orders", input);
    return res.data;
  },

  validateCoupon: async (input: {
    couponCode: string;
    items: Array<{
      productId: string;
      quantity: number;
      selections?: Array<{ optionId: string; valueKeys: string[] }>;
    }>;
  }) => {
    const res = await api.post<ApiOkResponse<{ discount: number; couponCode: string }>>(
      "/api/orders/validate-coupon",
      input
    );
    return res.data;
  },
};
