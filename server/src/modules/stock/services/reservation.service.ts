import { Types } from 'mongoose';
import { AppError } from '../../../shared/middleware/errorHandler';
import { StockItemModel } from '../models/stock.model';
import { ensureStockItemExists } from './stock.service';

export type StockReservationItem = { productId: string; quantity: number };

export async function reserveStock(items: StockReservationItem[]): Promise<void> {
  const reserved: StockReservationItem[] = [];

  for (const item of items) {
    const productId = new Types.ObjectId(item.productId);
    await ensureStockItemExists(productId);

    const updated = await StockItemModel.findOneAndUpdate(
      { productId, availableQty: { $gte: item.quantity } },
      { $inc: { availableQty: -item.quantity, reservedQty: item.quantity } },
      { new: true }
    );

    if (!updated) {
      // rollback anything reserved so far
      await releaseStock(reserved);
      throw new AppError('Insufficient stock', 409, 'out_of_stock');
    }

    reserved.push(item);
  }
}

export async function releaseStock(items: StockReservationItem[]): Promise<void> {
  for (const item of items) {
    const productId = new Types.ObjectId(item.productId);
    await ensureStockItemExists(productId);

    await StockItemModel.updateOne(
      { productId },
      { $inc: { availableQty: item.quantity, reservedQty: -item.quantity } }
    );
  }
}

export async function fulfillReservedStock(items: StockReservationItem[]): Promise<void> {
  for (const item of items) {
    const productId = new Types.ObjectId(item.productId);
    await ensureStockItemExists(productId);

    const updated = await StockItemModel.findOneAndUpdate(
      { productId, reservedQty: { $gte: item.quantity } },
      { $inc: { reservedQty: -item.quantity, onHandQty: -item.quantity } },
      { new: true }
    );

    if (!updated) {
      throw new AppError('Reserved stock not found', 409, 'stock_conflict');
    }
  }
}
