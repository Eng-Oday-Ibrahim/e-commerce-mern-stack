import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, required: true, ref: 'Order', index: true },
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'Customer', index: true },
    provider: { type: String, required: true, default: 'stripe' },
    providerSessionId: { type: String, required: false, index: true },
    providerPaymentIntentId: { type: String, required: false, index: true },
    status: { type: String, required: true, default: 'pending', enum: PAYMENT_STATUSES, index: true },
    currencyCode: { type: String, required: true, trim: true, uppercase: true },
    amount: { type: Schema.Types.Decimal128, required: true },
    refundedAmount: { type: Schema.Types.Decimal128, required: true, default: 0 },
    meta: { type: Schema.Types.Mixed, required: false },
    paidAt: { type: Date, required: false },
    failedAt: { type: Date, required: false },
    refundedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

paymentSchema.index({ providerSessionId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ providerPaymentIntentId: 1 }, { unique: true, sparse: true });

paymentSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    const dec = (v: any) => {
      const raw = v?.toString?.() ?? v;
      const n = typeof raw === 'string' ? Number(raw) : Number(raw);
      return Number.isFinite(n) ? n : 0;
    };
    if (obj.amount != null) obj.amount = dec(obj.amount);
    if (obj.refundedAmount != null) obj.refundedAmount = dec(obj.refundedAmount);
    return obj;
  },
});

export type Payment = InferSchemaType<typeof paymentSchema> & {
  orderId: Types.ObjectId;
  customerId: Types.ObjectId;
  status: PaymentStatus;
};

export const PaymentModel =
  (mongoose.models.Payment as mongoose.Model<Payment> | undefined) ||
  mongoose.model<Payment>('Payment', paymentSchema);

