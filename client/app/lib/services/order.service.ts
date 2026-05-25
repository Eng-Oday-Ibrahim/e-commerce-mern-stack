import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { OrderApi } from "@/api/order";

export const OrderService = {
  listAdmin: async () => {
    return OrderApi.listAdmin();
  },

  getAdminById: async (id: string) => {
    return OrderApi.getAdminById(id);
  },

  updateStatus: async (id: string, status: Parameters<typeof OrderApi.updateStatus>[1]) => {
    try {
      const res = await OrderApi.updateStatus(id, status);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  updateShippingStatus: async (
    id: string,
    shippingStatus: Parameters<typeof OrderApi.updateShippingStatus>[1]
  ) => {
    try {
      const res = await OrderApi.updateShippingStatus(id, shippingStatus);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
  updatePaymentStatus: async (
    id: string,
    paymentStatus: Parameters<typeof OrderApi.updatePaymentStatus>[1]
  ) => {
    try {
      const res = await OrderApi.updatePaymentStatus(id, paymentStatus);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
  listMine: async () => {
    return OrderApi.listMine();
  },
  getMineById: async (id: string) => {
    return OrderApi.getMineById(id);
  },
  getPublicById: async (id: string, accessToken: string) => {
    return OrderApi.getPublicById(id, accessToken);
  },
  trackByNumber: async (orderNumber: number | string, phone?: string) => {
    try {
      return await OrderApi.trackOrder(orderNumber, phone);
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
  searchByPhone: async (phone: string) => {
    try {
      return await OrderApi.searchByPhone(phone);
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
  create: async (input: Parameters<typeof OrderApi.create>[0], opts?: { silent?: boolean }) => {
    try {
      const res = await OrderApi.create(input);
      if (!opts?.silent) Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  validateCoupon: async (input: Parameters<typeof OrderApi.validateCoupon>[0]) => {
    return await OrderApi.validateCoupon(input);
  },
};
