import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { ProductCreateSchema, ProductUpdateSchema } from '../validators/product.validator';
import {
  createProduct,
  getProductAdminById,
  getProductById,
  getProductStoreDetailBySlug,
  getProductStoreDetail,
  listAllProducts,
  listPublicProducts,
  updateProduct,
  deleteProduct,
} from '../services/product.service';

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const products = await listPublicProducts();
  res.json({ ok: true, products });
});

export const getStoreDetail = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.id as string;
  const detail = await getProductStoreDetail(productId);
  res.json({ ok: true, ...detail });
});

export const getStoreDetailBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const detail = await getProductStoreDetailBySlug(slug);
  res.json({ ok: true, ...detail });
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const products = await listAllProducts();
  res.json({ ok: true, products });
});

export const getPublicById = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.id as string;
  const product = await getProductById(productId);
  if (!product.isActive) {
    res.status(404).json({ ok: false, code: 'not_found', message: 'Product not found' });
    return;
  }
  res.json({ ok: true, product });
});

export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.id as string;
  const product = await getProductAdminById(productId);
  res.json({ ok: true, product });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = ProductCreateSchema.parse(req.body);
  const product: any = await createProduct(body);
  res.status(201).json({ ok: true, product: product.toJSON() });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const body = ProductUpdateSchema.parse(req.body);
  const productId = req.params.id as string;
  const product: any = await updateProduct(productId, body);
  res.json({ ok: true, product: product.toJSON() });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteProduct(req.params.id as string);
  res.json({ ok: true });
});
