import mongoose, { InferSchemaType, Schema } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';
import type { LocalizedString } from '../../../shared/types/i18n';

const shippingMethodSchema = new Schema(
  {
    name: { type: localizedStringSchema, required: true },

    // Store as Decimal128 major units (e.g. 5.00).
    price: { type: Schema.Types.Decimal128, required: true },

    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

shippingMethodSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    if (obj.price != null) {
      const raw = obj.price?.toString?.() ?? obj.price;
      const n = typeof raw === 'string' ? Number(raw) : raw;
      obj.price = Number.isFinite(n) ? n : 0;
    }
    return obj;
  },
});

export type ShippingMethod = InferSchemaType<typeof shippingMethodSchema> & {
  name: LocalizedString;
};

export const ShippingMethodModel =
  (mongoose.models.ShippingMethod as mongoose.Model<ShippingMethod> | undefined) ||
  mongoose.model<ShippingMethod>('ShippingMethod', shippingMethodSchema);
