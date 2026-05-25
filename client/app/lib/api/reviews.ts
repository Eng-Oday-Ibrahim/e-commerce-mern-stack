import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "@/api/types";

export type ReviewDto = {
  id: string;
  productId: string;
  customerId?: string;
  rating: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
};

export type PendingReviewDto = ReviewDto & {
  product?: { id: string; slug: string; name: { ar: string; en: string } };
  customer?: { id: string; email: string; name: string };
};

export const ReviewApi = {
  listApprovedForProduct: async (productId: string) => {
    const res = await api.get<ApiOkResponse<{ reviews: ReviewDto[] }>>(
      `/api/reviews/products/${productId}`
    );
    return res.data;
  },

  createForProduct: async (productId: string, body: { rating: number; description: string }) => {
    const res = await api.post<ApiOkResponse<{ review: ReviewDto }>>(
      `/api/reviews/products/${productId}`,
      body
    );
    return res.data;
  },

  listPendingAdmin: async () => {
    const res = await api.get<ApiOkResponse<{ reviews: PendingReviewDto[] }>>(
      "/api/reviews/admin/pending"
    );
    return res.data;
  },

  getAdminById: async (reviewId: string) => {
    const res = await api.get<ApiOkResponse<{ review: PendingReviewDto }>>(
      `/api/reviews/admin/${reviewId}`
    );
    return res.data;
  },

  setStatusAdmin: async (reviewId: string, status: ReviewDto["status"]) => {
    const res = await api.patch<ApiOkResponse<{ review: ReviewDto }>>(
      `/api/reviews/admin/${reviewId}`,
      { status }
    );
    return res.data;
  },

  deleteAdmin: async (reviewId: string) => {
    const res = await api.delete<ApiOkResponse<Record<string, never>>>(`/api/reviews/admin/${reviewId}`);
    return res.data;
  },
};
