import { Types } from 'mongoose';
import { AppError } from '../../../shared/middleware/errorHandler';
import { StockItemModel } from '../models/stock.model';
import { ProductModel } from '../../catalog/models/product.model';
import { sanitizeLeanArray } from '../../../shared/utils/sanitizeLean';

export async function ensureStockItemExists(productId: Types.ObjectId): Promise<void> {
  await StockItemModel.updateOne(
    { productId },
    {
      $setOnInsert: {
        productId,
        onHandQty: 0,
        reservedQty: 0,
        availableQty: 0,
      },
    },
    { upsert: true }
  );
}

export async function getStockByProductId(productIdRaw: string) {
  const productId = new Types.ObjectId(productIdRaw);
  await ensureStockItemExists(productId);

  const stock = await StockItemModel.findOne({ productId });
  if (!stock) throw new AppError('Stock not found', 404, 'not_found');
  return stock;
}

export async function getPublicStockByProductId(productIdRaw: string) {
  const productId = new Types.ObjectId(productIdRaw);
  await ensureStockItemExists(productId);
  const stock = await StockItemModel.findOne({ productId }).lean();
  return {
    productId: productIdRaw,
    availableQty: Number((stock as any)?.availableQty ?? 0),
  };
}

export async function setOnHandQty(productIdRaw: string, onHandQty: number) {
  const productId = new Types.ObjectId(productIdRaw);
  await ensureStockItemExists(productId);

  const updated = await StockItemModel.findOneAndUpdate(
    { productId, reservedQty: { $lte: onHandQty } },
    [
      {
        $set: {
          onHandQty,
          availableQty: { $subtract: [onHandQty, '$reservedQty'] },
        },
      },
    ],
    { new: true, updatePipeline: true }
  );

  if (!updated) {
    throw new AppError('Cannot set stock below reserved quantity', 400, 'validation_error');
  }

  return updated;
}

export async function adjustOnHandQty(productIdRaw: string, delta: number) {
  const productId = new Types.ObjectId(productIdRaw);
  await ensureStockItemExists(productId);

  const updated = await StockItemModel.findOneAndUpdate(
    {
      productId,
      $expr: {
        $gte: [{ $add: ['$onHandQty', delta] }, '$reservedQty'],
      },
    },
    [
      {
        $set: {
          onHandQty: { $add: ['$onHandQty', delta] },
          availableQty: { $subtract: [{ $add: ['$onHandQty', delta] }, '$reservedQty'] },
        },
      },
    ],
    { new: true, updatePipeline: true }
  );

  if (!updated) {
    throw new AppError('Insufficient stock to decrease', 400, 'validation_error');
  }

  return updated;
}

export async function listAllStock() {
  const products = await ProductModel.find({})
    .select({ slug: 1, name: 1, isActive: 1 })
    .sort({ createdAt: -1 })
    .lean();

  const productIds = (products as any[]).map((p) => p._id);
  const stocks = await StockItemModel.find({ productId: { $in: productIds } }).lean();

  const stockByProductId = new Map<string, any>();
  for (const s of stocks as any[]) {
    stockByProductId.set(s.productId.toString(), s);
  }

  return (products as any[]).map((p) => {
    const stock = stockByProductId.get(p._id.toString());
    const sanitizedProduct = sanitizeLeanArray([p])[0] as any;
    return {
      product: sanitizedProduct,
      stock: stock
        ? {
            ...stock,
            id: stock._id?.toString?.() ?? stock._id,
            productId: stock.productId?.toString?.() ?? stock.productId,
          }
        : {
            id: `stock_${sanitizedProduct.id}`,
            productId: sanitizedProduct.id,
            onHandQty: 0,
            reservedQty: 0,
            availableQty: 0,
          },
    };
  });
}
