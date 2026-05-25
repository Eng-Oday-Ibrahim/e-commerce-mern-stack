import mongoose, { InferSchemaType, Schema } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';
import type { LocalizedString } from '../../../shared/types/i18n';

const shippingCountrySchema = new Schema(
  {
    name: { type: localizedStringSchema, required: true },

    // Store as Decimal128 major units (e.g. 5.00).
    taxFee: { type: Schema.Types.Decimal128, required: true, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

shippingCountrySchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    if (obj.taxFee != null) {
      const raw = obj.taxFee?.toString?.() ?? obj.taxFee;
      const n = typeof raw === 'string' ? Number(raw) : raw;
      obj.taxFee = Number.isFinite(n) ? n : 0;
    }
    return obj;
  },
});

export type ShippingCountry = InferSchemaType<typeof shippingCountrySchema> & {
  name: LocalizedString;
};

export const ShippingCountryModel =
  (mongoose.models.ShippingCountry as mongoose.Model<ShippingCountry> | undefined) ||
  mongoose.model<ShippingCountry>('ShippingCountry', shippingCountrySchema);

