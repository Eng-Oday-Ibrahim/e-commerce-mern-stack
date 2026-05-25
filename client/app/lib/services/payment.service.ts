import { PaymentApi } from "@/api/payment";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export const PaymentService = {
  createCheckoutSession: async (input: { orderId: string; accessToken?: string }) => {
    try {
      return await PaymentApi.createCheckoutSession(input);
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
  listAdmin: async () => PaymentApi.listAdmin(),
  listMine: async () => PaymentApi.listMine(),
  getSettings: async () => PaymentApi.getSettings(),
  getPublicSettings: async () => PaymentApi.getPublicSettings(),
  updateStatus: async (id: string, status: Parameters<typeof PaymentApi.updateStatus>[1]) => {
    try {
      const out = await PaymentApi.updateStatus(id, status);
      Toast.saved();
      return out;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
  updateSettings: async (input: Parameters<typeof PaymentApi.updateSettings>[0]) => {
    try {
      const out = await PaymentApi.updateSettings(input);
      Toast.saved();
      return out;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};

