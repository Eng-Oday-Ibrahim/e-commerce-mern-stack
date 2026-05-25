import { OptionApi } from "@/lib/api/catalog/option";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import type { LocalizedString } from "@/lib/api/catalog/types";

export const OptionService = {
  listPublic: async () => {
    return OptionApi.listPublic();
  },

  listAdmin: async () => {
    return OptionApi.listAdmin();
  },

  getAdminById: async (id: string) => {
    return OptionApi.getAdminById(id);
  },

  create: async (input: {
    slug: string;
    name: LocalizedString;
    type?: "text" | "color";
    values?: Array<{ key?: string; value?: string; hex?: string }>;
    isActive?: boolean;
  }) => {
    try {
      const res = await OptionApi.create(input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  update: async (id: string, input: any) => {
    try {
      const res = await OptionApi.update(id, input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
