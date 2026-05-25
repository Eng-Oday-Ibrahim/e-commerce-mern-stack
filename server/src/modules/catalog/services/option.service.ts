import { Types } from 'mongoose';
import { CACHE_KEYS } from '../../../infrastructure/cache/cache.keys';
import { cacheService } from '../../../infrastructure/cache/cache.service';
import { AppError } from '../../../shared/middleware/errorHandler';
import { sanitizeLeanArray, sanitizeLeanDoc } from '../../../shared/utils/sanitizeLean';
import { OptionModel } from '../models/option.model';
import { ProductModel } from '../models/product.model';
import { randomToken } from '../../../shared/utils/crypto';

const PUBLIC_LIST_TTL_SECONDS = 60;
const BY_ID_TTL_SECONDS = 5 * 60;
const ADMIN_LIST_TTL_SECONDS = 30;

function normalizeOptionValues(
  type: 'text' | 'color',
  values: Array<{ key?: string; value?: string; hex?: string }>
) {
  return values.map((v) => {
    const key = (typeof v.key === 'string' && v.key.trim().length ? v.key.trim() : randomToken(6));
    const value = typeof v.value === 'string' ? v.value.trim() : undefined;
    const hex = typeof v.hex === 'string' ? v.hex.trim() : undefined;

    if (type === 'color') {
      const color = hex ?? value;
      if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) {
        throw new AppError('Invalid color value', 400, 'validation_error');
      }
      return { key, value: color, hex: color };
    }

    // text
    return { key, value: value && value.length ? value : key };
  });
}

export async function listPublicOptions() {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.CATALOG.OPTIONS_PUBLIC);
  if (cached) return cached;

  const options = await OptionModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();

  const sanitized = sanitizeLeanArray(options as any).map((o: any) => ({
    ...o,
    type: o.type ?? 'text',
    values: Array.isArray(o.values) ? o.values : [],
  }));
  await cacheService.set(CACHE_KEYS.CATALOG.OPTIONS_PUBLIC, sanitized, PUBLIC_LIST_TTL_SECONDS);
  return sanitized;
}

export async function listAllOptions() {
  const cached = await cacheService.get<any[]>(CACHE_KEYS.CATALOG.OPTIONS_ALL);
  if (cached) return cached;

  const options = await OptionModel.find({}).sort({ createdAt: -1 }).lean();

  const sanitized = sanitizeLeanArray(options as any).map((o: any) => ({
    ...o,
    type: o.type ?? 'text',
    values: Array.isArray(o.values) ? o.values : [],
  }));
  await cacheService.set(CACHE_KEYS.CATALOG.OPTIONS_ALL, sanitized, ADMIN_LIST_TTL_SECONDS);
  return sanitized;
}

export async function getOptionById(optionId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.CATALOG.OPTION_BY_ID(optionId));
  if (cached) return cached;

  const option = await OptionModel.findById(optionId).lean();
  if (!option) throw new AppError('Option not found', 404, 'not_found');

  const sanitized: any = sanitizeLeanDoc(option as any);
  sanitized.type = sanitized.type ?? 'text';
  sanitized.values = Array.isArray(sanitized.values) ? sanitized.values : [];
  await cacheService.set(CACHE_KEYS.CATALOG.OPTION_BY_ID(optionId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function getOptionAdminById(optionId: string) {
  const cached = await cacheService.get<any>(CACHE_KEYS.CATALOG.OPTION_ADMIN_BY_ID(optionId));
  if (cached) return cached;

  const option = await OptionModel.findById(optionId).lean();
  if (!option) throw new AppError('Option not found', 404, 'not_found');

  const sanitized: any = sanitizeLeanDoc(option as any);
  sanitized.type = sanitized.type ?? 'text';
  sanitized.values = Array.isArray(sanitized.values) ? sanitized.values : [];
  await cacheService.set(CACHE_KEYS.CATALOG.OPTION_ADMIN_BY_ID(optionId), sanitized, BY_ID_TTL_SECONDS);
  return sanitized;
}

export async function createOption(input: {
  slug: string;
  name: { ar: string; en: string };
  type?: 'text' | 'color';
  values?: Array<{ key?: string; value?: string; hex?: string }>;
  isActive?: boolean;
}) {
  const type = (input.type ?? 'text') as 'text' | 'color';
  const values = normalizeOptionValues(type, input.values ?? []);

  const option = await OptionModel.create({
    slug: input.slug.toLowerCase().trim(),
    name: input.name,
    type,
    values,
    isActive: input.isActive ?? true,
  });

  await cacheService.del(CACHE_KEYS.CATALOG.OPTIONS_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.OPTIONS_ALL);
  return option;
}

export async function updateOption(
  optionId: string,
  input: Partial<{
    slug: string;
    name: { ar: string; en: string };
    type: 'text' | 'color';
    values: Array<{ key?: string; value?: string; hex?: string }>;
    isActive: boolean;
  }>
) {
  const update: any = { ...input };
  if (typeof update.slug === 'string') update.slug = update.slug.toLowerCase().trim();

  if (typeof update.type === 'string') {
    if (update.type !== 'text' && update.type !== 'color') {
      throw new AppError('Invalid option type', 400, 'validation_error');
    }
  }

  if (Array.isArray(update.values)) {
    const type = (update.type as 'text' | 'color') ?? ((await OptionModel.findById(optionId))?.type ?? 'text');
    update.values = normalizeOptionValues(type, update.values);
  }

  const option = await OptionModel.findByIdAndUpdate(optionId, update, { new: true });
  if (!option) throw new AppError('Option not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.CATALOG.OPTIONS_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.OPTION_BY_ID(optionId));
  await cacheService.del(CACHE_KEYS.CATALOG.OPTIONS_ALL);
  await cacheService.del(CACHE_KEYS.CATALOG.OPTION_ADMIN_BY_ID(optionId));
  return option;
}

export async function deleteOption(optionId: string) {
  const oid = new Types.ObjectId(optionId);
  const used = await ProductModel.exists({
    $or: [{ optionIds: oid }, { 'options.optionId': oid }],
  });
  if (used) throw new AppError('Cannot delete an option assigned to products', 409, 'conflict');

  const doc = await OptionModel.findByIdAndDelete(optionId);
  if (!doc) throw new AppError('Option not found', 404, 'not_found');

  await cacheService.del(CACHE_KEYS.CATALOG.OPTIONS_PUBLIC);
  await cacheService.del(CACHE_KEYS.CATALOG.OPTION_BY_ID(optionId));
  await cacheService.del(CACHE_KEYS.CATALOG.OPTIONS_ALL);
  await cacheService.del(CACHE_KEYS.CATALOG.OPTION_ADMIN_BY_ID(optionId));
}
