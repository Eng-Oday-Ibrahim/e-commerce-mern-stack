import { Types } from 'mongoose';
import { CACHE_KEYS } from '../../../infrastructure/cache/cache.keys';
import { cacheService } from '../../../infrastructure/cache/cache.service';
import { AppError } from '../../../shared/middleware/errorHandler';
import { sanitizeLeanArray, sanitizeLeanDoc } from '../../../shared/utils/sanitizeLean';
import { ShippingCountryModel } from '../models/shippingCountry.model';
import { ShippingCityModel } from '../models/shippingCity.model';

const PUBLIC_LIST_TTL_SECONDS = 60;
const BY_ID_TTL_SECONDS = 5 * 60;

export async function listPublicCountriesWithCities() {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.SHIPPING.COUNTRIES_PUBLIC);
  if (cached) return cached;

  const countries = await ShippingCountryModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  const countryIds = countries.map((c: any) => c._id);

  const cities = await ShippingCityModel.find({ countryId: { $in: countryIds }, isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  const citiesByCountry = new Map<string, any[]>();
  for (const city of cities as any[]) {
    const key = city.countryId.toString();
    const arr = citiesByCountry.get(key) ?? [];
    arr.push(city);
    citiesByCountry.set(key, arr);
  }

  const out = sanitizeLeanArray(
    (countries as any[]).map((c) => ({
      ...c,
      cities: sanitizeLeanArray(citiesByCountry.get(c._id.toString()) ?? []),
    })) as any
  );

  await cacheService.set(CACHE_KEYS.SHIPPING.COUNTRIES_PUBLIC, out, PUBLIC_LIST_TTL_SECONDS);
  return out;
}

export async function listAllCountries() {
  const countries = await ShippingCountryModel.find({}).sort({ createdAt: -1 }).lean();
  const ids = (countries as any[]).map((c) => c._id);

  const counts =
    ids.length === 0
      ? []
      : await ShippingCityModel.aggregate([
          { $match: { countryId: { $in: ids } } },
          { $group: { _id: '$countryId', count: { $sum: 1 } } },
        ]);

  const byId = new Map<string, number>(counts.map((r: any) => [String(r._id), Number(r.count) || 0]));

  return sanitizeLeanArray(
    (countries as any[]).map((c) => ({
      ...c,
      citiesCount: byId.get(String(c._id)) ?? 0,
    })) as any
  );
}

export async function getCountryById(countryId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.SHIPPING.COUNTRY_BY_ID(countryId));
  if (cached) return cached;

  const doc = await ShippingCountryModel.findById(countryId).lean();
  if (!doc) throw new AppError('Shipping country not found', 404, 'not_found');

  const sanitized = sanitizeLeanDoc(doc as any);
  await cacheService.set(CACHE_KEYS.SHIPPING.COUNTRY_BY_ID(countryId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function createCountry(input: {
  name: { ar: string; en: string };
  taxFee?: number;
  isActive?: boolean;
}) {
  const country = await ShippingCountryModel.create({
    name: input.name,
    taxFee: input.taxFee ?? 0,
    isActive: input.isActive ?? true,
  });

  await cacheService.del(CACHE_KEYS.SHIPPING.COUNTRIES_PUBLIC);
  return country;
}

export async function updateCountry(
  countryId: string,
  input: Partial<{
    name: { ar: string; en: string };
    taxFee: number;
    isActive: boolean;
  }>
) {
  const update: any = { ...input };

  const country = await ShippingCountryModel.findByIdAndUpdate(countryId, update, { new: true });
  if (!country) throw new AppError('Shipping country not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.SHIPPING.COUNTRIES_PUBLIC);
  await cacheService.del(CACHE_KEYS.SHIPPING.COUNTRY_BY_ID(countryId));
  return country;
}

export async function deleteCountry(countryIdRaw: string) {
  const countryId = new Types.ObjectId(countryIdRaw);

  const existed = await ShippingCountryModel.findById(countryId);
  if (!existed) throw new AppError('Shipping country not found', 404, 'not_found');

  await ShippingCityModel.deleteMany({ countryId });
  await ShippingCountryModel.deleteOne({ _id: countryId });

  await cacheService.del(CACHE_KEYS.SHIPPING.COUNTRIES_PUBLIC);
  await cacheService.del(CACHE_KEYS.SHIPPING.COUNTRY_BY_ID(countryIdRaw));
}

export async function listCitiesByCountry(countryId: string) {
  const cities = await ShippingCityModel.find({ countryId }).sort({ createdAt: -1 }).lean();
  return sanitizeLeanArray(cities as any);
}

export async function getCityById(cityId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.SHIPPING.CITY_BY_ID(cityId));
  if (cached) return cached;

  const doc = await ShippingCityModel.findById(cityId).lean();
  if (!doc) throw new AppError('Shipping city not found', 404, 'not_found');

  const sanitized = sanitizeLeanDoc(doc as any);
  await cacheService.set(CACHE_KEYS.SHIPPING.CITY_BY_ID(cityId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function createCity(input: {
  countryId: string;
  name: { ar: string; en: string };
  price: number;
  isActive?: boolean;
}) {
  const country = await ShippingCountryModel.findById(input.countryId).lean();
  if (!country) throw new AppError('Shipping country not found', 404, 'not_found');

  const city = await ShippingCityModel.create({
    countryId: input.countryId,
    name: input.name,
    price: input.price,
    isActive: input.isActive ?? true,
  });

  await cacheService.del(CACHE_KEYS.SHIPPING.COUNTRIES_PUBLIC);
  return city;
}

export async function updateCity(
  cityId: string,
  input: Partial<{
    name: { ar: string; en: string };
    price: number;
    isActive: boolean;
  }>
) {
  const update: any = { ...input };

  const city = await ShippingCityModel.findByIdAndUpdate(cityId, update, { new: true });
  if (!city) throw new AppError('Shipping city not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.SHIPPING.COUNTRIES_PUBLIC);
  await cacheService.del(CACHE_KEYS.SHIPPING.CITY_BY_ID(cityId));
  return city;
}

export async function deleteCity(cityIdRaw: string) {
  const city = await ShippingCityModel.findByIdAndDelete(cityIdRaw);
  if (!city) throw new AppError('Shipping city not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.SHIPPING.COUNTRIES_PUBLIC);
  await cacheService.del(CACHE_KEYS.SHIPPING.CITY_BY_ID(cityIdRaw));
}
