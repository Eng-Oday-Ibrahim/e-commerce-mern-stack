import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';
import type { LocalizedString } from '../../../shared/types/i18n';

const shippingCitySchema = new Schema(
  {
    countryId: { type: Schema.Types.ObjectId, required: true, ref: 'ShippingCountry' },
    name: { type: localizedStringSchema, required: true },

    // Store as Decimal128 major units (e.g. 5.00).
    price: { type: Schema.Types.Decimal128, required: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

shippingCitySchema.index({ countryId: 1, createdAt: -1 });

shippingCitySchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    if (obj.countryId) obj.countryId = obj.countryId?.toString?.() ?? obj.countryId;
    if (obj.price != null) {
      const raw = obj.price?.toString?.() ?? obj.price;
      const n = typeof raw === 'string' ? Number(raw) : raw;
      obj.price = Number.isFinite(n) ? n : 0;
    }
    return obj;
  },
});

export type ShippingCity = InferSchemaType<typeof shippingCitySchema> & {
  name: LocalizedString;
  countryId: Types.ObjectId;
};

export const ShippingCityModel =
  (mongoose.models.ShippingCity as mongoose.Model<ShippingCity> | undefined) ||
  mongoose.model<ShippingCity>('ShippingCity', shippingCitySchema);

