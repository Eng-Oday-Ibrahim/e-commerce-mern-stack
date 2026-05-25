import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { ShippingApi } from "@/api/shipping";

export const ShippingService = {
  listPublicCountries: async () => ShippingApi.listPublicCountries(),
  listAllCountries: async () => ShippingApi.listAllCountries(),
  getCountry: async (id: string) => ShippingApi.getCountry(id),
  getCity: async (id: string) => ShippingApi.getCity(id),

  createCountry: async (input: Parameters<typeof ShippingApi.createCountry>[0]) => {
    try {
      const res = await ShippingApi.createCountry(input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  updateCountry: async (id: string, input: Parameters<typeof ShippingApi.updateCountry>[1]) => {
    try {
      const res = await ShippingApi.updateCountry(id, input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  deleteCountry: async (id: string) => {
    try {
      const res = await ShippingApi.deleteCountry(id);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  listCitiesByCountry: async (countryId: string) => ShippingApi.listCitiesByCountry(countryId),

  createCity: async (input: Parameters<typeof ShippingApi.createCity>[0]) => {
    try {
      const res = await ShippingApi.createCity(input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  updateCity: async (id: string, input: Parameters<typeof ShippingApi.updateCity>[1]) => {
    try {
      const res = await ShippingApi.updateCity(id, input);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },

  deleteCity: async (id: string) => {
    try {
      const res = await ShippingApi.deleteCity(id);
      Toast.saved();
      return res;
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
