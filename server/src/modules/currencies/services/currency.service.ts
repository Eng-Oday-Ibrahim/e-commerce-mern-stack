import { AppError } from '../../../shared/middleware/errorHandler';
import { sanitizeLeanArray, sanitizeLeanDoc } from '../../../shared/utils/sanitizeLean';
import { CurrencyModel } from '../models/currency.model';
import { OrderModel } from '../../orders/models/order.model';

export async function listAllCurrencies() {
  const currencies = await CurrencyModel.find({}).sort({ sortOrder: 1, code: 1 }).lean();
  return sanitizeLeanArray(currencies as any);
}

export async function getCurrencyById(id: string) {
  const currency = await CurrencyModel.findById(id).lean();
  if (!currency) throw new AppError('Currency not found', 404, 'not_found');
  return sanitizeLeanDoc(currency as any);
}

export async function createCurrency(input: {
  code: string;
  name: string;
  symbol?: string;
  decimals?: number;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}) {
  const code = input.code.toUpperCase().trim();
  const currency = await CurrencyModel.create({
    code,
    name: input.name.trim(),
    symbol: input.symbol?.trim(),
    decimals: input.decimals ?? 2,
    isDefault: input.isDefault ?? false,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });

  if (currency.isDefault) {
    await CurrencyModel.updateMany({ _id: { $ne: currency._id } }, { $set: { isDefault: false } });
  }

  return currency;
}

export async function updateCurrency(
  id: string,
  input: Partial<{
    code: string;
    name: string;
    symbol: string | null;
    decimals: number;
    isDefault: boolean;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  const update: any = { ...input };
  if (typeof update.code === 'string') update.code = update.code.toUpperCase().trim();
  if (typeof update.name === 'string') update.name = update.name.trim();
  if (Object.prototype.hasOwnProperty.call(update, 'symbol') && update.symbol === null) {
    update.symbol = undefined;
  } else if (typeof update.symbol === 'string') {
    update.symbol = update.symbol.trim();
  }

  const currency = await CurrencyModel.findByIdAndUpdate(id, update, { new: true });
  if (!currency) throw new AppError('Currency not found', 404, 'not_found');

  if (currency.isDefault) {
    await CurrencyModel.updateMany({ _id: { $ne: currency._id } }, { $set: { isDefault: false } });
  }

  return currency;
}

export async function getDefaultActiveCurrency() {
  const doc =
    (await CurrencyModel.findOne({ isDefault: true, isActive: true }).lean()) ||
    (await CurrencyModel.findOne({ isActive: true }).sort({ sortOrder: 1, code: 1 }).lean());

  if (!doc) {
    return { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, isDefault: true, isActive: true };
  }

  return sanitizeLeanDoc(doc as any);
}

export async function removeCurrency(id: string) {
  const currency = await CurrencyModel.findById(id);
  if (!currency) throw new AppError('Currency not found', 404, 'not_found');
  if (currency.isDefault) throw new AppError('Cannot delete the default currency', 409, 'conflict');

  const used = await OrderModel.exists({ currencyCode: currency.code });
  if (used) throw new AppError('Cannot delete a currency used by orders', 409, 'conflict');

  await CurrencyModel.deleteOne({ _id: currency._id });
}
