import { Types } from 'mongoose';
import { AppError } from '../../../shared/middleware/errorHandler';
import { sanitizeLeanArray, sanitizeLeanDoc } from '../../../shared/utils/sanitizeLean';
import { OrderModel } from '../../orders/models/order.model';
import { CustomerModel } from '../models/customer.model';

export async function listCustomersAdmin() {
  const rows = await CustomerModel.find({}).sort({ createdAt: -1 }).limit(500).lean();
  return sanitizeLeanArray(rows as any);
}

export async function getCustomerAdminDetail(customerIdRaw: string) {
  const customer = await CustomerModel.findById(customerIdRaw).lean();
  if (!customer) throw new AppError('Customer not found', 404, 'not_found');

  const orders = await OrderModel.find({ customerId: new Types.ObjectId(customerIdRaw) })
    .sort({ createdAt: -1 })
    .limit(50)
    .select({
      orderNumber: 1,
      status: 1,
      total: 1,
      currencyCode: 1,
      createdAt: 1,
    })
    .lean();

  return {
    customer: sanitizeLeanDoc(customer as any),
    orders: sanitizeLeanArray(orders as any),
  };
}
