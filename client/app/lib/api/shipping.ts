import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "./types";

export type ShippingCountryDto = {
  id: string;
  name: { ar: string; en: string };
  taxFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  citiesCount?: number;
  cities?: ShippingCityDto[];
};

export type ShippingCityDto = {
  id: string;
  countryId: string;
  name: { ar: string; en: string };
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const ShippingApi = {
  listPublicCountries: async () => {
    const res = await api.get<ApiOkResponse<{ countries: ShippingCountryDto[] }>>("/api/shipping/countries");
    return res.data;
  },

  listAllCountries: async () => {
    const res = await api.get<ApiOkResponse<{ countries: ShippingCountryDto[] }>>("/api/shipping/countries/all");
    return res.data;
  },

  getCountry: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ country: ShippingCountryDto }>>(`/api/shipping/countries/${id}`);
    return res.data;
  },

  createCountry: async (input: {
    name: { ar: string; en: string };
    taxFee?: number;
    isActive?: boolean;
  }) => {
    const res = await api.post<ApiOkResponse<{ country: ShippingCountryDto }>>("/api/shipping/countries", input);
    return res.data;
  },

  updateCountry: async (id: string, input: Partial<{
    name: { ar: string; en: string };
    taxFee: number;
    isActive: boolean;
  }>) => {
    const res = await api.patch<ApiOkResponse<{ country: ShippingCountryDto }>>(`/api/shipping/countries/${id}`, input);
    return res.data;
  },

  deleteCountry: async (id: string) => {
    const res = await api.delete<ApiOkResponse<{}>>(`/api/shipping/countries/${id}`);
    return res.data;
  },

  listCitiesByCountry: async (countryId: string) => {
    const res = await api.get<ApiOkResponse<{ cities: ShippingCityDto[] }>>(`/api/shipping/countries/${countryId}/cities`);
    return res.data;
  },

  getCity: async (id: string) => {
    const res = await api.get<ApiOkResponse<{ city: ShippingCityDto }>>(`/api/shipping/cities/${id}`);
    return res.data;
  },

  createCity: async (input: {
    countryId: string;
    name: { ar: string; en: string };
    price: number;
    isActive?: boolean;
  }) => {
    const res = await api.post<ApiOkResponse<{ city: ShippingCityDto }>>("/api/shipping/cities", input);
    return res.data;
  },

  updateCity: async (id: string, input: Partial<{
    name: { ar: string; en: string };
    price: number;
    isActive: boolean;
  }>) => {
    const res = await api.patch<ApiOkResponse<{ city: ShippingCityDto }>>(`/api/shipping/cities/${id}`, input);
    return res.data;
  },

  deleteCity: async (id: string) => {
    const res = await api.delete<ApiOkResponse<{}>>(`/api/shipping/cities/${id}`);
    return res.data;
  },
};
