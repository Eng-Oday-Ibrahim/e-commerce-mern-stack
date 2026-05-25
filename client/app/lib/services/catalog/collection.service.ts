import { CollectionApi } from "@/lib/api/catalog/collection";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import type { LocalizedString } from "@/lib/api/catalog/types";

export const CollectionService = {
  listPublic: async () => {
    return CollectionApi.listPublic();
  },

  listAdmin: async () => {
    return CollectionApi.listAdmin();
  },

  getAdminById: async (id: string) => {
    return CollectionApi.getAdminById(id);
  },

  create: async (input: {
    name: LocalizedString;
    description?: LocalizedString;
    productIds?: string[];
    imageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) => {
    try {
      const res = await CollectionApi.create(input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  update: async (id: string, input: any) => {
    try {
      const res = await CollectionApi.update(id, input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
