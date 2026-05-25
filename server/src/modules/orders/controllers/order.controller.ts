import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { AppError } from '../../../shared/middleware/errorHandler';
import {
  OrderCreateSchema,
  OrderUpdatePaymentStatusSchema,
  OrderUpdateShippingStatusSchema,
  OrderUpdateStatusSchema,
  OrderValidateCouponSchema,
} from '../validators/order.validator';
import {
  cancelOrderForCustomer,
  createOrder,
  createGuestCustomer,
  getOrderAdminById,
  getOrderByNumber,
  getOrderForCustomer,
  getOrderForPublic,
  listAllOrders,
  listOrdersByPhone,
  listOrdersForCustomer,
  updateOrderShippingStatus,
  updateOrderPaymentStatus,
  updateOrderStatus,
  validateCouponCode,
} from '../services/order.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = OrderCreateSchema.parse(req.body);

  const customerId =
    req.auth?.subject.type === 'customer'
      ? req.auth.subject.id
      : (await createGuestCustomer({ fullName: body.shippingAddress.fullName, phone: body.shippingAddress.phone })).id;

  const result = await createOrder({
    customerId,
    items: body.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      selections: item.selections,
    })),
    shippingMethodId: body.shippingMethodId,
    shippingAddress: body.shippingAddress,
    couponCode: body.couponCode,
  });

  res.status(201).json({ ok: true, order: (result.order as any).toJSON(), accessToken: result.accessToken });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'customer') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }

  const orders = await listOrdersForCustomer(req.auth.subject.id);
  res.json({ ok: true, orders });
});

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const body = OrderValidateCouponSchema.parse(req.body);
  const customerId = req.auth?.subject.type === 'customer' ? req.auth.subject.id : undefined;
  const applied = await validateCouponCode({
    couponCode: body.couponCode,
    items: body.items,
    customerId,
  });
  res.json({ ok: true, discount: applied.discount, couponCode: applied.normalizedCode });
});

export const getMineById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'customer') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }

  const orderId = req.params.id as string;
  const order = await getOrderForCustomer(req.auth.subject.id, orderId);
  res.json({ ok: true, order: (order as any).toJSON() });
});

export const getPublicById = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = String(req.query.accessToken || '');
  if (!accessToken) throw new AppError('Unauthorized', 401, 'unauthorized');

  const orderId = req.params.id as string;
  const order = await getOrderForPublic(orderId, accessToken);
  res.json({ ok: true, order: (order as any).toJSON() });
});

export const track = asyncHandler(async (req: Request, res: Response) => {
  const orderNumber = Number(req.query.orderNumber);
  if (!Number.isFinite(orderNumber) || orderNumber <= 0) {
    throw new AppError('Order number is required', 400, 'validation_error');
  }

  const phone = String(req.query.phone || '').trim();
  const order = await getOrderByNumber(orderNumber, phone || undefined);
  res.json({ ok: true, order: (order as any).toJSON() });
});

export const searchByPhone = asyncHandler(async (req: Request, res: Response) => {
  const phone = String(req.params.phone || '').trim();
  if (!phone) throw new AppError('Phone number is required', 400, 'validation_error');

  const orders = await listOrdersByPhone(phone);
  res.json({ ok: true, orders });
});

export const cancelMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'customer') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }

  const orderId = req.params.id as string;
  const order = await cancelOrderForCustomer(req.auth.subject.id, orderId);
  res.json({ ok: true, order: (order as any).toJSON() });
});

// Admin endpoints
export const list = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await listAllOrders();
  res.json({ ok: true, orders });
});

export const getByIdAdmin = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const order = await getOrderAdminById(orderId);
  res.json({ ok: true, order });
});

export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const body = OrderUpdateStatusSchema.parse(req.body);
  const order = await updateOrderStatus(orderId, body.status);
  res.json({ ok: true, order: (order as any).toJSON() });
});

export const setShippingStatus = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const body = OrderUpdateShippingStatusSchema.parse(req.body);
  const order = await updateOrderShippingStatus(orderId, body.shippingStatus);
  res.json({ ok: true, order: (order as any).toJSON() });
});

export const setPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const body = OrderUpdatePaymentStatusSchema.parse(req.body);
  const order = await updateOrderPaymentStatus(orderId, body.paymentStatus);
  res.json({ ok: true, order: (order as any).toJSON() });
});
