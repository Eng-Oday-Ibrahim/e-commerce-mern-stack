import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { StockApi } from "@/api/stock";

export const StockService = {
  getPublicByProductId: async (productId: string) => {
    return StockApi.getPublicByProductId(productId);
  },
  listAll: async () => {
    return StockApi.listAll();
  },

  getByProductId: async (productId: string) => {
    return StockApi.getByProductId(productId);
  },

  setOnHand: async (productId: string, onHandQty: number) => {
    try {
      const res = await StockApi.setOnHand(productId, onHandQty);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  adjustOnHand: async (productId: string, delta: number, reason?: string) => {
    try {
      const res = await StockApi.adjustOnHand(productId, delta, reason);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
