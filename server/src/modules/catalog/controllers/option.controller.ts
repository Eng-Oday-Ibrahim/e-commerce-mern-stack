import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { OptionCreateSchema, OptionUpdateSchema } from '../validators/option.validator';
import {
  createOption,
  getOptionAdminById,
  getOptionById,
  listAllOptions,
  listPublicOptions,
  updateOption,
  deleteOption,
} from '../services/option.service';

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const options = await listPublicOptions();
  res.json({ ok: true, options });
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const options = await listAllOptions();
  res.json({ ok: true, options });
});

export const getPublicById = asyncHandler(async (req: Request, res: Response) => {
  const optionId = req.params.id as string;
  const option = await getOptionById(optionId);
  if (!option.isActive) {
    res.status(404).json({ ok: false, code: 'not_found', message: 'Option not found' });
    return;
  }
  res.json({ ok: true, option });
});

export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const optionId = req.params.id as string;
  const option = await getOptionAdminById(optionId);
  res.json({ ok: true, option });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = OptionCreateSchema.parse(req.body);
  const option = await createOption(body);
  res.status(201).json({ ok: true, option: option.toJSON() });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const body = OptionUpdateSchema.parse(req.body);
  const optionId = req.params.id as string;
  const option = await updateOption(optionId, body);
  res.json({ ok: true, option: option.toJSON() });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteOption(req.params.id as string);
  res.json({ ok: true });
});
