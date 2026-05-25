import { CurrencyApi } from "@/api/currency";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export const CurrencyService = {
  listAll: async () => {
    return CurrencyApi.listAll();
  },

  getById: async (id: string) => {
    return CurrencyApi.getById(id);
  },

  create: async (input: Parameters<typeof CurrencyApi.create>[0]) => {
    try {
      const res = await CurrencyApi.create(input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  update: async (id: string, input: Parameters<typeof CurrencyApi.update>[1]) => {
    try {
      const res = await CurrencyApi.update(id, input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  delete: async (id: string) => {
    try {
      const res = await CurrencyApi.delete(id);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
