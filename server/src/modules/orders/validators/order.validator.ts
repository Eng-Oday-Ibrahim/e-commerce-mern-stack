import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_STATUSES, SHIPPING_ORDER_STATUSES } from '../models/order.model';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const OrderItemSelectionSchema = z.object({
  optionId: objectId,
  valueKeys: z.array(z.string().min(1).max(120)).max(50),
});

export const OrderItemCreateSchema = z.object({
  productId: objectId,
  quantity: z.number().int().min(1).max(1_000_000),
  selections: z.array(OrderItemSelectionSchema).max(50).optional(),
});

export const OrderAddressSchema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().min(5).max(40),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(2).max(100),
  postalCode: z.string().max(40).optional(),
});

export const OrderCreateSchema = z.object({
  items: z.array(OrderItemCreateSchema).min(1),
  shippingMethodId: objectId,
  shippingAddress: OrderAddressSchema,
  couponCode: z.string().trim().min(2).max(40).optional(),
});

export const OrderValidateCouponSchema = z.object({
  couponCode: z.string().trim().min(2).max(40),
  items: z.array(OrderItemCreateSchema).min(1),
});

export const OrderUpdateStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const OrderUpdateShippingStatusSchema = z.object({
  shippingStatus: z.enum(SHIPPING_ORDER_STATUSES),
});

export const OrderUpdatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(PAYMENT_STATUSES),
});
