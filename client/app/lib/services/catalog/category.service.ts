import { CategoryApi } from "@/lib/api/catalog/category";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import type { LocalizedString } from "@/lib/api/catalog/types";

export const CategoryService = {
  listPublic: async () => {
    return CategoryApi.listPublic();
  },

  listAdmin: async () => {
    return CategoryApi.listAdmin();
  },

  getAdminById: async (id: string) => {
    return CategoryApi.getAdminById(id);
  },

  create: async (input: {
    name: LocalizedString;
    description?: LocalizedString;
    imageUrl?: string;
    parentCategoryId?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) => {
    try {
      const res = await CategoryApi.create(input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  update: async (id: string, input: any) => {
    try {
      const res = await CategoryApi.update(id, input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
