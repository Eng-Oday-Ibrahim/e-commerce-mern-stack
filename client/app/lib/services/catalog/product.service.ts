import { ProductApi } from "@/lib/api/catalog/product";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import type { LocalizedString } from "@/lib/api/catalog/types";

export const ProductService = {
  listPublic: async () => {
    return ProductApi.listPublic();
  },

  listAdmin: async () => {
    return ProductApi.listAdmin();
  },

  getAdminById: async (id: string) => {
    return ProductApi.getAdminById(id);
  },

  create: async (input: {
    name: LocalizedString;
    description?: LocalizedString;
    price: number;
    categoryIds?: string[];
    optionIds?: string[];
    options?: Array<{ optionId: string; valueKeys: string[] }>;
    images?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
  }) => {
    try {
      const res = await ProductApi.create(input);
      Toast.productAdded();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  update: async (id: string, input: any) => {
    try {
      const res = await ProductApi.update(id, input);
      Toast.productUpdated();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
