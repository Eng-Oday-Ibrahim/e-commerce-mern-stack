import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { StockAdjustSchema, StockSetOnHandSchema } from '../validators/stock.validator';
import {
  adjustOnHandQty,
  getPublicStockByProductId,
  getStockByProductId,
  listAllStock,
  setOnHandQty,
} from '../services/stock.service';

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const items = await listAllStock();
  res.json({ ok: true, items });
});

export const getByProductId = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const stock = await getStockByProductId(productId);
  res.json({ ok: true, stock: stock.toJSON() });
});

export const getPublicByProductId = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const stock = await getPublicStockByProductId(productId);
  res.json({ ok: true, stock });
});

export const setOnHand = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const body = StockSetOnHandSchema.parse({ ...req.body, productId });
  const stock = await setOnHandQty(body.productId, body.onHandQty);
  res.json({ ok: true, stock: stock.toJSON() });
});

export const adjustOnHand = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const body = StockAdjustSchema.parse({ ...req.body, productId });
  const stock = await adjustOnHandQty(body.productId, body.delta);
  res.json({ ok: true, stock: stock.toJSON() });
});
