import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';
import type { LocalizedString } from '../../../shared/types/i18n';

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'canceled', 'refunded'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const SHIPPING_ORDER_STATUSES = [
  'pending',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'returned',
] as const;
export type ShippingOrderStatus = (typeof SHIPPING_ORDER_STATUSES)[number];

const addressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, required: false, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: false, trim: true },
    country: { type: String, required: true, trim: true },
    postalCode: { type: String, required: false, trim: true },
  },
  { _id: false }
);

const orderItemOptionSnapshotSchema = new Schema(
  {
    optionId: { type: Schema.Types.ObjectId, required: true, ref: 'Option' },
    valueKeys: { type: [String], default: [] },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Schema.Types.Decimal128, required: true },

    productSlug: { type: String, required: true },
    productName: { type: localizedStringSchema, required: true },

    optionSelections: { type: [orderItemOptionSnapshotSchema], required: false },
  },
  { _id: false }
);

const shippingSnapshotSchema = new Schema(
  {
    countryId: { type: Schema.Types.ObjectId, required: true, ref: 'ShippingCountry' },
    countryName: { type: localizedStringSchema, required: true },
    cityId: { type: Schema.Types.ObjectId, required: true, ref: 'ShippingCity' },
    cityName: { type: localizedStringSchema, required: true },
    price: { type: Schema.Types.Decimal128, required: true },
  },
  { _id: false }
);

const stockReservationSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: Number, required: true, unique: true },

    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'Customer' },
    /**
     * Public access token hash for guest checkout.
     * Raw token is only returned once on order creation and never stored.
     */
    publicAccessTokenHash: { type: String, required: false, select: false, index: true },
    status: { type: String, required: true, default: 'pending' },
    paymentStatus: { type: String, required: true, default: 'pending', enum: PAYMENT_STATUSES },
    shippingStatus: { type: String, required: true, default: 'pending', enum: SHIPPING_ORDER_STATUSES },

    currencyCode: { type: String, required: true },
    subtotal: { type: Schema.Types.Decimal128, required: true },
    discount: { type: Schema.Types.Decimal128, default: 0 },
    couponCode: { type: String, required: false, trim: true, uppercase: true },
    shippingFee: { type: Schema.Types.Decimal128, required: true },
    taxLabel: { type: String, required: true, default: 'Tax' },
    taxRate: { type: Number, required: true, default: 0 },
    taxAmount: { type: Schema.Types.Decimal128, required: true, default: 0 },
    total: { type: Schema.Types.Decimal128, required: true },

    items: { type: [orderItemSchema], required: true },
    shipping: { type: shippingSnapshotSchema, required: true },
    shippingAddress: { type: addressSchema, required: true },

    reservedStock: { type: [stockReservationSchema], required: true },

    paidAt: { type: Date, required: false },
    shippedAt: { type: Date, required: false },
    cancelledAt: { type: Date, required: false },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    delete obj.publicAccessTokenHash;
    const dec = (v: any) => {
      const raw = v?.toString?.() ?? v;
      const n = typeof raw === 'string' ? Number(raw) : Number(raw);
      return Number.isFinite(n) ? n : 0;
    };
    if (obj.subtotal != null) obj.subtotal = dec(obj.subtotal);
    if (obj.discount != null) obj.discount = dec(obj.discount);
    if (obj.shippingFee != null) obj.shippingFee = dec(obj.shippingFee);
    if (obj.taxAmount != null) obj.taxAmount = dec(obj.taxAmount);
    if (obj.total != null) obj.total = dec(obj.total);
    if (Array.isArray(obj.items)) {
      obj.items = obj.items.map((it: any) => ({
        ...it,
        unitPrice: it?.unitPrice != null ? dec(it.unitPrice) : 0,
      }));
    }
    if (obj.shipping?.price != null) obj.shipping.price = dec(obj.shipping.price);
    return obj;
  },
});

export type Order = InferSchemaType<typeof orderSchema> & {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingOrderStatus;
  customerId: Types.ObjectId;
  items: Array<{
    productId: Types.ObjectId;
    productSlug: string;
    productName: LocalizedString;
    quantity: number;
    unitPrice: number;
    optionSelections?: Array<{
      optionId: Types.ObjectId;
      valueKeys: string[];
    }>;
  }>;
  reservedStock: Array<{ productId: Types.ObjectId; quantity: number }>;
  shipping: {
    countryId: Types.ObjectId;
    countryName: LocalizedString;
    cityId: Types.ObjectId;
    cityName: LocalizedString;
    price: any;
  };
};

export const OrderModel =
  (mongoose.models.Order as mongoose.Model<Order> | undefined) ||
  mongoose.model<Order>('Order', orderSchema);
