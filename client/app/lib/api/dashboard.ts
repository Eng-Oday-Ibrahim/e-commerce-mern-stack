import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "@/api/types";

export type DashboardAnalytics = {
  ordersByStatus: Record<string, number>;
  revenueTotal: number;
  pendingReviews: number;
  lowStockCount: number;
  lowStockThreshold: number;
  newCustomersCount: number;
  recentOrders: Array<{
    id: string;
    orderNumber: number;
    status: string;
    total: number;
    currencyCode: string;
    createdAt: string;
  }>;
  trend: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  rangeStart: string;
  rangeEnd: string;
};

export const DashboardApi = {
  analytics: async (params?: { from?: string; to?: string }) => {
    const query = params
      ? new URLSearchParams(Object.entries(params).filter(([, value]) => value).map(([key, value]) => [key, value ?? ''])).toString()
      : "";
    const res = await api.get<ApiOkResponse<{ analytics: DashboardAnalytics }>>(
      "/api/dashboard/analytics" + (query ? `?${query}` : "")
    );
    return res.data;
  },
};
