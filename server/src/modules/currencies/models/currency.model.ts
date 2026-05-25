import mongoose, { InferSchemaType, Schema } from 'mongoose';

const currencySchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    symbol: { type: String, required: false, trim: true },
    decimals: { type: Number, required: true, default: 2, min: 0, max: 6 },

    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

currencySchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type Currency = InferSchemaType<typeof currencySchema>;

export const CurrencyModel =
  (mongoose.models.Currency as mongoose.Model<Currency> | undefined) ||
  mongoose.model<Currency>('Currency', currencySchema);

