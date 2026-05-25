import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { Types } from 'mongoose';
import { CounterModel } from '../../../shared/models/counter.model';
import { AppError } from '../../../shared/middleware/errorHandler';
import { OptionModel } from '../../catalog/models/option.model';
import { ProductModel } from '../../catalog/models/product.model';
import { ShippingCityModel } from '../../shipping/models/shippingCity.model';
import { ShippingCountryModel } from '../../shipping/models/shippingCountry.model';
import { reserveStock, releaseStock, fulfillReservedStock } from '../../stock/services/reservation.service';
import { OrderModel, type OrderStatus, type ShippingOrderStatus, type PaymentStatus } from '../models/order.model';
import { sanitizeLeanArray } from '../../../shared/utils/sanitizeLean';
import {
  computeCouponDiscount,
  incrementCouponUsage,
} from '../../marketing/services/couponCheckout.service';
import { getDefaultActiveCurrency } from '../../currencies/services/currency.service';
import { resolveOfferPricingForProducts } from '../../marketing/services/offerPricing.service';
import { CustomerModel } from '../../identity/models/customer.model';

function decToNum(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = v?.toString?.();
  const n = typeof s === 'string' ? Number(s) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function hashAccessToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function verifyOrderAccessToken(order: any, token: string): boolean {
  const hash = (order as any)?.publicAccessTokenHash;
  if (!hash || !token) return false;
  const a = Buffer.from(String(hash), 'hex');
  const b = Buffer.from(hashAccessToken(token), 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createGuestCustomer(input: { fullName: string; phone?: string }): Promise<{ id: string }> {
  const email = `guest+${randomBytes(12).toString('hex')}@guest.local`;
  const name = input.fullName.trim() || 'Guest';
  const password = randomBytes(24).toString('hex');
  const { hashPassword } = await import('../../../shared/utils/password');
  const customer = await CustomerModel.create({
    email,
    name,
    phone: input.phone,
    passwordHash: hashPassword(password),
  });
  return { id: customer._id.toString() };
}

function isAllowedOrderTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  const allowed: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'canceled'],
    confirmed: ['processing', 'canceled', 'pending'],
    processing: ['completed', 'canceled'],
    completed: ['refunded'],
    canceled: [],
    refunded: [],
  };
  return allowed[current].includes(next);
}

async function validateLinePricing(
  product: any,
  selectionsInput: Array<{ optionId: string; valueKeys: string[] }> | undefined
): Promise<{
  unitPrice: number;
  optionSelections: Array<{ optionId: Types.ObjectId; valueKeys: string[] }>;
}> {
  const rows = Array.isArray(product.options) ? product.options : [];
  const selections = selectionsInput ?? [];

  if (rows.length === 0) {
    if (selections.length > 0) {
      throw new AppError('This product does not support options', 400, 'validation_error');
    }
    return {
      unitPrice: decToNum(product.price),
      optionSelections: [],
    };
  }

  const requiredIds = rows.map((r: any) => r.optionId.toString());
  const reqSet = new Set(requiredIds);
  if (selections.length !== reqSet.size) {
    throw new AppError('Provide exactly one selection entry per product option', 400, 'validation_error');
  }

  const selByOpt = new Map(selections.map((s) => [s.optionId, s.valueKeys]));
  for (const sid of selections.map((s) => s.optionId)) {
    if (!reqSet.has(sid)) {
      throw new AppError('Unknown option in selections', 400, 'validation_error');
    }
  }

  const optionDocs = await OptionModel.find({
    _id: { $in: requiredIds.map((id: string) => new Types.ObjectId(id)) },
  }).lean();

  const docById = new Map((optionDocs as any[]).map((o) => [o._id.toString(), o]));

  const optionSelections: Array<{
    optionId: Types.ObjectId;
    valueKeys: string[];
  }> = [];

  for (const row of rows as any[]) {
    const oid = row.optionId.toString();
    const allowed = new Set<string>((row.valueKeys ?? []) as string[]);
    const keys = selByOpt.get(oid);
    if (!keys || keys.length === 0) {
      throw new AppError('Each option requires at least one value', 400, 'validation_error');
    }

    const doc = docById.get(oid);
    if (!doc) throw new AppError('Option not found', 400, 'validation_error');

    const validKeys = new Set((doc.values ?? []).map((v: any) => v.key));
    for (const k of keys) {
      if (!validKeys.has(k)) throw new AppError('Invalid option value', 400, 'validation_error');
      if (allowed.size > 0 && !allowed.has(k)) {
        throw new AppError('Option value not sold with this product', 400, 'validation_error');
      }
    }

    optionSelections.push({
      optionId: new Types.ObjectId(oid),
      valueKeys: [...keys],
    });
  }

  const unitPrice = round2(decToNum(product.price));
  if (unitPrice < 0) throw new AppError('Price cannot be negative', 400, 'validation_error');

  return { unitPrice, optionSelections };
}

type OrderInputItem = {
  productId: string;
  quantity: number;
  selections?: Array<{ optionId: string; valueKeys: string[] }>;
};

async function nextOrderNumber(): Promise<number> {
  const counter = await CounterModel.findOneAndUpdate(
    { _id: 'orders' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const seq = counter?.seq ?? 1;
  const rand6 = String(randomInt(0, 1_000_000)).padStart(6, '0');
  return Number(`${seq}${rand6}`);
}

async function buildOrderItems(inputItems: OrderInputItem[]) {
  const productIds = inputItems.map((i) => new Types.ObjectId(i.productId));
  const products = await ProductModel.find({ _id: { $in: productIds }, isActive: true }).lean();

  if (products.length !== inputItems.length) {
    throw new AppError('One or more products not found', 404, 'not_found');
  }

  for (const p of products) {
    if (decToNum((p as any).price) < 0) {
      throw new AppError('Product pricing missing', 400, 'validation_error');
    }
  }

  const productById = new Map(products.map((p) => [p._id.toString(), p]));
  const productOffers = await resolveOfferPricingForProducts(
    products.map((p: any) => ({
      id: p._id.toString(),
      price: decToNum(p.price),
      categoryIds: (p.categoryIds ?? []).map((x: any) => x.toString()),
    }))
  );

  const orderItems: Array<{
    productId: Types.ObjectId;
    quantity: number;
    unitPrice: number;
    productSlug: string;
    productName: { ar: string; en: string };
    optionSelections?: Array<{
      optionId: Types.ObjectId;
      valueKeys: string[];
    }>;
  }> = [];

  let subtotal = 0;
  let eligibleSubtotal = 0;

  for (const i of inputItems) {
    const product = productById.get(i.productId);
    if (!product) throw new AppError('Product not found', 404, 'not_found');

    const { unitPrice, optionSelections } = await validateLinePricing(product, i.selections);
    const offeredUnitPrice = productOffers.get(i.productId)?.finalPrice ?? unitPrice;
    const hasOffer = productOffers.has(i.productId);
    const lineTotal = offeredUnitPrice * i.quantity;

    subtotal += lineTotal;
    if (!hasOffer) {
      eligibleSubtotal += lineTotal;
    }

    orderItems.push({
      productId: new Types.ObjectId(i.productId),
      quantity: i.quantity,
      unitPrice: offeredUnitPrice,
      productSlug: product.slug,
      productName: product.name as { ar: string; en: string },
      ...(optionSelections.length ? { optionSelections } : {}),
    });
  }

  return {
    orderItems,
    subtotal: round2(subtotal),
    eligibleSubtotal: round2(eligibleSubtotal),
  };
}

export async function createOrder(input: {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    selections?: Array<{ optionId: string; valueKeys: string[] }>;
  }>;
  couponCode?: string;
  shippingMethodId: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
}) {
  const customerId = new Types.ObjectId(input.customerId);

  const shippingCity = await ShippingCityModel.findById(input.shippingMethodId);
  if (!shippingCity || !shippingCity.isActive) {
    throw new AppError('Shipping city not found', 404, 'not_found');
  }

  const shippingCountry = await ShippingCountryModel.findById((shippingCity as any).countryId);
  if (!shippingCountry || !shippingCountry.isActive) {
    throw new AppError('Shipping country not found', 404, 'not_found');
  }

  const { orderItems, subtotal, eligibleSubtotal } = await buildOrderItems(input.items);
  const currency = await getDefaultActiveCurrency();
  const currencyCode = (currency as any).code || 'USD';

  let discount = 0;
  let couponCode: string | undefined;
  let couponIdForIncrement: string | undefined;

  if (input.couponCode?.trim()) {
    const applied = await computeCouponDiscount({
      code: input.couponCode,
      customerId: input.customerId,
      currencyCode,
      subtotal: eligibleSubtotal,
    });
    discount = applied.discount;
    couponCode = applied.normalizedCode;
    couponIdForIncrement = applied.couponId;
  }

  const shippingFee = decToNum((shippingCity as any).price);
  // Convert tax fee to percentage (e.g., 17 → 0.17) and calculate as multiplier
  const taxPercentage = Math.max(0, decToNum((shippingCountry as any).taxFee)) / 100;
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const taxAmount = round2(subtotalAfterDiscount * taxPercentage);
  const total = round2(subtotalAfterDiscount * (1 + taxPercentage) + shippingFee);

  const reservedStock = input.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));

  await reserveStock(reservedStock);

  try {
    const orderNumber = await nextOrderNumber();
    const accessToken = randomBytes(32).toString('hex');
    const publicAccessTokenHash = hashAccessToken(accessToken);

    const order = await OrderModel.create({
      orderNumber,
      customerId,
      status: 'pending',
    paymentStatus: 'pending',
    shippingStatus: 'pending',
      publicAccessTokenHash,

      currencyCode,
      subtotal,
      discount,
      ...(couponCode ? { couponCode } : {}),
      shippingFee,
      taxLabel: 'Tax',
      taxRate: taxPercentage * 100,
      taxAmount,
      total,

      items: orderItems,
      shipping: {
        countryId: shippingCountry._id,
        countryName: shippingCountry.name,
        cityId: shippingCity._id,
        cityName: shippingCity.name,
        price: shippingFee as any,
      },
      shippingAddress: input.shippingAddress,

      reservedStock: reservedStock.map((r) => ({
        productId: new Types.ObjectId(r.productId),
        quantity: r.quantity,
      })),
    });

    if (couponIdForIncrement) {
      await incrementCouponUsage(couponIdForIncrement);
    }

    return { order, accessToken };
  } catch (err) {
    await releaseStock(reservedStock);
    throw err;
  }
}

export async function validateCouponCode(input: {
  couponCode: string;
  items: OrderInputItem[];
  customerId?: string;
}) {
  const currency = await getDefaultActiveCurrency();
  const currencyCode = (currency as any).code || 'USD';
  const { eligibleSubtotal } = await buildOrderItems(input.items);
  const applied = await computeCouponDiscount({
    code: input.couponCode,
    customerId: input.customerId,
    currencyCode,
    subtotal: eligibleSubtotal,
  });
  return applied;
}

function normalizePhone(phoneRaw: string): string {
  return String(phoneRaw ?? "").replace(/\D/g, "");
}

function makePhoneQueryRegex(phoneRaw: string) {
  const normalized = normalizePhone(phoneRaw);
  if (!normalized) return null;
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.split("").join("\\D*")}$`, "i");
}

export async function getOrderByNumber(orderNumber: number, phoneRaw?: string) {
  const query: any = { orderNumber };
  if (phoneRaw?.trim()) {
    const regex = makePhoneQueryRegex(phoneRaw);
    if (regex) {
      query["shippingAddress.phone"] = regex;
    }
  }

  const order = await OrderModel.findOne(query);
  if (!order) throw new AppError("Order not found", 404, "not_found");
  return order;
}

export async function listOrdersByPhone(phoneRaw: string) {
  const regex = makePhoneQueryRegex(phoneRaw);
  if (!regex) return [];
  const orders = await OrderModel.find({ "shippingAddress.phone": regex }).sort({ createdAt: -1 }).lean();
  return sanitizeLeanArray(orders as any);
}

export async function listOrdersForCustomer(customerIdRaw: string) {
  const customerId = new Types.ObjectId(customerIdRaw);
  const orders = await OrderModel.find({ customerId }).sort({ createdAt: -1 }).lean();
  return sanitizeLeanArray(orders as any);
}

export async function getOrderForCustomer(customerIdRaw: string, orderIdRaw: string) {
  const customerId = new Types.ObjectId(customerIdRaw);
  const order = await OrderModel.findOne({ _id: orderIdRaw, customerId });
  if (!order) throw new AppError('Order not found', 404, 'not_found');
  return order;
}

export async function getOrderForPublic(orderIdRaw: string, accessToken: string) {
  const order = await OrderModel.findById(orderIdRaw).select('+publicAccessTokenHash');
  if (!order) throw new AppError('Order not found', 404, 'not_found');
  if (!verifyOrderAccessToken(order, accessToken)) {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }
  return order;
}

export async function cancelOrderForCustomer(customerIdRaw: string, orderIdRaw: string) {
  const order = await getOrderForCustomer(customerIdRaw, orderIdRaw);

  if (order.status === 'canceled') return order;
  if (order.shippingStatus !== 'pending' && order.shippingStatus !== 'packed') {
    throw new AppError('Order can no longer be canceled', 409, 'conflict');
  }

  const reserved = (order.reservedStock || []).map((r) => ({
    productId: r.productId.toString(),
    quantity: r.quantity,
  }));

  if (reserved.length > 0) {
    await releaseStock(reserved);
    order.reservedStock = [] as unknown as typeof order.reservedStock;
  }

  order.status = 'canceled';
  order.cancelledAt = new Date();
  await order.save();

  return order;
}

export async function listAllOrders() {
  const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
  return sanitizeLeanArray(orders as any);
}

export async function getOrderAdminById(orderIdRaw: string) {
  const doc: any = await OrderModel.findById(orderIdRaw);
  if (!doc) throw new AppError('Order not found', 404, 'not_found');

  const customer =
    doc.customerId != null
      ? await CustomerModel.findById(doc.customerId).select({ email: 1, name: 1 }).lean()
      : null;

  const order = doc.toJSON();
  return {
    ...order,
    customer: customer
      ? {
          id: (customer as any)._id?.toString?.() ?? String((customer as any)._id),
          email: (customer as any).email,
          name: (customer as any).name,
        }
      : undefined,
  };
}

export async function updateOrderStatus(orderIdRaw: string, status: OrderStatus) {
  const order = await OrderModel.findById(orderIdRaw);
  if (!order) throw new AppError('Order not found', 404, 'not_found');

  if (order.status === status) return order;
  if (!isAllowedOrderTransition(order.status as OrderStatus, status)) {
    throw new AppError(`Invalid status transition: ${order.status} -> ${status}`, 409, 'conflict');
  }

  if (status === 'canceled') {
    if (order.shippingStatus !== 'pending' && order.shippingStatus !== 'packed') {
      throw new AppError('Order can no longer be canceled', 409, 'conflict');
    }

    const reserved = (order.reservedStock || []).map((r) => ({
      productId: r.productId.toString(),
      quantity: r.quantity,
    }));

    if (reserved.length > 0) {
      await releaseStock(reserved);
      order.reservedStock = [] as unknown as typeof order.reservedStock;
    }

    order.status = 'canceled';
    order.cancelledAt = new Date();
    await order.save();
    return order;
  }

  if (status === 'confirmed') {
    if (order.status === 'canceled' || order.status === 'refunded') throw new AppError('Order is closed', 409, 'conflict');
    order.status = 'confirmed';
    await order.save();
    return order;
  }

  if (status === 'processing') {
    if (order.status === 'canceled' || order.status === 'refunded') throw new AppError('Order is closed', 409, 'conflict');
    order.status = 'processing';
    await order.save();
    return order;
  }

  if (status === 'completed') {
    if (order.status === 'canceled' || order.status === 'refunded') throw new AppError('Order is closed', 409, 'conflict');
    const reserved = (order.reservedStock || []).map((r) => ({
      productId: r.productId.toString(),
      quantity: r.quantity,
    }));
    if (reserved.length > 0) {
      await fulfillReservedStock(reserved);
      order.reservedStock = [] as unknown as typeof order.reservedStock;
    }
    order.status = 'completed';
    if (order.shippingStatus !== 'delivered') order.shippingStatus = 'delivered';
    await order.save();
    return order;
  }

  if (status === 'refunded') {
    order.status = 'refunded';
    await order.save();
    return order;
  }

  // pending
  if (order.status === 'canceled' || order.status === 'refunded') {
    throw new AppError('Cannot reopen a closed order', 409, 'conflict');
  }
  order.status = 'pending';
  await order.save();
  return order;
}

export async function updateOrderShippingStatus(orderIdRaw: string, shippingStatus: ShippingOrderStatus) {
  const order = await OrderModel.findById(orderIdRaw);
  if (!order) throw new AppError('Order not found', 404, 'not_found');
  if (order.shippingStatus === shippingStatus) return order;
  if (order.status === 'canceled' || order.status === 'refunded') {
    throw new AppError('Cannot update shipping on closed order', 409, 'conflict');
  }
  if (shippingStatus === 'delivered' && order.status !== 'completed') {
    order.status = 'completed';
  }
  order.shippingStatus = shippingStatus;
  await order.save();
  return order;
}

export async function updateOrderPaymentStatus(orderIdRaw: string, paymentStatus: PaymentStatus) {
  const order = await OrderModel.findById(orderIdRaw);
  if (!order) throw new AppError('Order not found', 404, 'not_found');
  if (order.paymentStatus === paymentStatus) return order;
  if (order.status === 'canceled' && paymentStatus === 'paid') {
    throw new AppError('Cannot mark canceled order as paid', 409, 'conflict');
  }
  order.paymentStatus = paymentStatus;
  if (paymentStatus === 'paid' && order.status === 'pending') {
    order.status = 'confirmed';
    order.paidAt = new Date();
  }
  if (paymentStatus === 'refunded' || paymentStatus === 'partially_refunded') {
    if (order.status !== 'refunded') order.status = 'refunded';
  }
  await order.save();
  return order;
}
