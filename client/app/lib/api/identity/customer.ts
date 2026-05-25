import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "../types";

export type LocalizedString = { ar: string; en: string };

export type CustomerDto = {
  id: string;
  email: string;
  phone?: string;
  name: string;
  wishlistProductIds?: string[];
  createdAt: string;
  updatedAt: string;
};


export const CustomerApi = {
  // Customers
  register: async (input: { name: string; email: string; password: string }) => {
    const res = await api.post<
      ApiOkResponse<{ sessionId: string; customer: CustomerDto }>
    >("/api/identity/customers/register", input);
    return res.data;
  },

  login: async (input: { email: string; password: string }) => {
    const res = await api.post<
      ApiOkResponse<{ sessionId: string; customer: CustomerDto }>
    >("/api/identity/customers/login", input);
    return res.data;
  },

  logout: async () => {
    const res = await api.post<ApiOkResponse>("/api/identity/customers/logout");
    return res.data;
  },

  me: async () => {
    const res = await api.get<ApiOkResponse<{ customerId: string; customer: CustomerDto }>>(
      "/api/identity/customers/me"
    );
    return res.data;
  },

  wishlistList: async () => {
    const res = await api.get<ApiOkResponse<{ wishlistProductIds: string[] }>>(
      "/api/identity/customers/wishlist"
    );
    return res.data;
  },
  wishlistAdd: async (productId: string) => {
    const res = await api.post<ApiOkResponse<{ wishlistProductIds: string[] }>>(
      `/api/identity/customers/wishlist/${productId}`
    );
    return res.data;
  },
  wishlistRemove: async (productId: string) => {
    const res = await api.delete<ApiOkResponse<{ wishlistProductIds: string[] }>>(
      `/api/identity/customers/wishlist/${productId}`
    );
    return res.data;
  },

  forgotPassword: async (input: { email: string }) => {
    const res = await api.post<ApiOkResponse & { dev?: any }>(
      "/api/identity/customers/forgot-password",
      input
    );
    return res.data;
  },

  listAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ customers: CustomerDto[] }>>(
      "/api/identity/customers/admin/all"
    );
    return res.data;
  },

  getAdminById: async (customerId: string) => {
    const res = await api.get<
      ApiOkResponse<{ customer: CustomerDto; orders: unknown[] }>
    >(`/api/identity/customers/admin/${customerId}`);
    return res.data;
  },

  resetPassword: async (input: { token: string; newPassword: string }) => {
    const res = await api.post<
      ApiOkResponse<{ sessionId: string; customer: CustomerDto }>
    >("/api/identity/customers/reset-password", input);
    return res.data;
  },


};
