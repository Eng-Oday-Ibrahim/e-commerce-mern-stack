import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { CurrencyCreateSchema, CurrencyUpdateSchema } from '../validators/currency.validator';
import {
  createCurrency,
  getCurrencyById,
  getDefaultActiveCurrency,
  listAllCurrencies,
  removeCurrency,
  updateCurrency,
} from '../services/currency.service';

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const currencies = await listAllCurrencies();
  res.json({ ok: true, currencies });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const currency = await getCurrencyById(id);
  res.json({ ok: true, currency });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = CurrencyCreateSchema.parse(req.body);
  const currency = await createCurrency(body);
  res.status(201).json({ ok: true, currency: currency.toJSON() });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const body = CurrencyUpdateSchema.parse(req.body);
  const id = req.params.id as string;
  const currency = await updateCurrency(id, body);
  res.json({ ok: true, currency: currency.toJSON() });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await removeCurrency(id);
  res.json({ ok: true });
});

export const getPublicDefault = asyncHandler(async (_req: Request, res: Response) => {
  const currency = await getDefaultActiveCurrency();
  res.json({ ok: true, currency });
});
