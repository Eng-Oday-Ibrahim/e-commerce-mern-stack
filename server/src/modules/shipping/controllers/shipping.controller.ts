import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import {
  ShippingCityCreateSchema,
  ShippingCityUpdateSchema,
  ShippingCountryCreateSchema,
  ShippingCountryUpdateSchema,
} from '../validators/shipping.validator';
import {
  createCity,
  createCountry,
  deleteCity,
  deleteCountry,
  getCityById,
  getCountryById,
  listAllCountries,
  listCitiesByCountry,
  listPublicCountriesWithCities,
  updateCity,
  updateCountry,
} from '../services/shipping.service';

export const listPublicCountries = asyncHandler(async (_req: Request, res: Response) => {
  const countries = await listPublicCountriesWithCities();
  res.json({ ok: true, countries });
});

export const listAllCountriesController = asyncHandler(async (_req: Request, res: Response) => {
  const countries = await listAllCountries();
  res.json({ ok: true, countries });
});

export const getCountry = asyncHandler(async (req: Request, res: Response) => {
  const country = await getCountryById(req.params.id as string);
  res.json({ ok: true, country });
});

export const createCountryController = asyncHandler(async (req: Request, res: Response) => {
  const body = ShippingCountryCreateSchema.parse(req.body);
  const country: any = await createCountry(body);
  res.status(201).json({ ok: true, country: country.toJSON() });
});

export const updateCountryController = asyncHandler(async (req: Request, res: Response) => {
  const body = ShippingCountryUpdateSchema.parse(req.body);
  const country: any = await updateCountry(req.params.id as string, body);
  res.json({ ok: true, country: country.toJSON() });
});

export const deleteCountryController = asyncHandler(async (req: Request, res: Response) => {
  await deleteCountry(req.params.id as string);
  res.json({ ok: true });
});

export const listCities = asyncHandler(async (req: Request, res: Response) => {
  const countryId = req.params.countryId as string;
  const cities = await listCitiesByCountry(countryId);
  res.json({ ok: true, cities });
});

export const getCity = asyncHandler(async (req: Request, res: Response) => {
  const city = await getCityById(req.params.id as string);
  res.json({ ok: true, city });
});

export const createCityController = asyncHandler(async (req: Request, res: Response) => {
  const body = ShippingCityCreateSchema.parse(req.body);
  const city: any = await createCity(body);
  res.status(201).json({ ok: true, city: city.toJSON() });
});

export const updateCityController = asyncHandler(async (req: Request, res: Response) => {
  const body = ShippingCityUpdateSchema.parse(req.body);
  const city: any = await updateCity(req.params.id as string, body);
  res.json({ ok: true, city: city.toJSON() });
});

export const deleteCityController = asyncHandler(async (req: Request, res: Response) => {
  await deleteCity(req.params.id as string);
  res.json({ ok: true });
});

