import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { CategoryCreateSchema, CategoryUpdateSchema } from '../validators/category.validator';
import {
  createCategory,
  getCategoryAdminById,
  getCategoryById,
  listAllCategories,
  listPublicCategories,
  updateCategory,
  deleteCategory,
} from '../services/category.service';

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await listPublicCategories();
  res.json({ ok: true, categories });
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await listAllCategories();
  res.json({ ok: true, categories });
});

export const getPublicById = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = req.params.id as string;
  const category = await getCategoryById(categoryId);
  if (!category.isActive) {
    res.status(404).json({ ok: false, code: 'not_found', message: 'Category not found' });
    return;
  }
  res.json({ ok: true, category });
});

export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = req.params.id as string;
  const category = await getCategoryAdminById(categoryId);
  res.json({ ok: true, category });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = CategoryCreateSchema.parse(req.body);
  const category = await createCategory(body);
  res.status(201).json({ ok: true, category: category.toJSON() });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const body = CategoryUpdateSchema.parse(req.body);
  const categoryId = req.params.id as string;
  const category = await updateCategory(categoryId, body);
  res.json({ ok: true, category: category.toJSON() });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteCategory(req.params.id as string);
  res.json({ ok: true });
});
