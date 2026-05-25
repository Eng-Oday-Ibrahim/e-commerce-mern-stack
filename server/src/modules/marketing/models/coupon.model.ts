import mongoose, { InferSchemaType, Schema } from 'mongoose';

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, required: true, enum: ['percent', 'fixed'] },
    percentOff: { type: Number, min: 1, max: 100 },
    fixedOff: { type: Schema.Types.Decimal128, min: 0 },
    minSubtotal: { type: Schema.Types.Decimal128, default: 0, min: 0 },
    maxRedemptions: { type: Number, min: 1, default: null },
    redemptionsCount: { type: Number, default: 0, min: 0 },
    perCustomerMax: { type: Number, default: 1, min: 1 },
    currencyCode: { type: String, trim: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.set('toJSON', {
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
    if (obj.fixedOff != null) obj.fixedOff = dec(obj.fixedOff);
    if (obj.minSubtotal != null) obj.minSubtotal = dec(obj.minSubtotal);
    return obj;
  },
});

export type Coupon = InferSchemaType<typeof couponSchema> & {
  type: 'percent' | 'fixed';
};

export const CouponModel =
  (mongoose.models.Coupon as mongoose.Model<Coupon> | undefined) ||
  mongoose.model<Coupon>('Coupon', couponSchema);
