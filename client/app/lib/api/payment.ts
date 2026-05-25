import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "./types";

export type PaymentDto = {
  id: string;
  orderId: string;
  customerId: string;
  provider: string;
  providerSessionId?: string;
  providerPaymentIntentId?: string;
  status: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  currencyCode: string;
  amount: number;
  refundedAmount: number;
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentSettingsDto = {
  id: string;
  provider: string;
  stripePublishableKey: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  taxMode: "exclusive" | "inclusive";
  taxRate: number;
  taxLabel: string;
  currencyCode: string;
};

export const PaymentApi = {
  createCheckoutSession: async (input: { orderId: string; accessToken?: string }) => {
    const res = await api.post<ApiOkResponse<{ sessionId: string; url: string | null }>>(
      "/api/payments/checkout-session",
      input
    );
    return res.data;
  },

  listAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ payments: PaymentDto[] }>>("/api/payments/admin");
    return res.data;
  },

  listMine: async () => {
    const res = await api.get<ApiOkResponse<{ payments: PaymentDto[] }>>("/api/payments/mine");
    return res.data;
  },

  updateStatus: async (id: string, status: PaymentDto["status"]) => {
    const res = await api.patch<ApiOkResponse<{ payment: PaymentDto }>>(`/api/payments/${id}/status`, { status });
    return res.data;
  },

  getSettings: async () => {
    const res = await api.get<ApiOkResponse<{ settings: PaymentSettingsDto }>>("/api/payments/settings");
    return res.data;
  },

  getPublicSettings: async () => {
    const res = await api.get<ApiOkResponse<{ settings: PaymentSettingsDto }>>("/api/payments/settings/public");
    return res.data;
  },

  updateSettings: async (input: Partial<PaymentSettingsDto>) => {
    const res = await api.patch<ApiOkResponse<{ settings: PaymentSettingsDto }>>("/api/payments/settings", input);
    return res.data;
  },
};
