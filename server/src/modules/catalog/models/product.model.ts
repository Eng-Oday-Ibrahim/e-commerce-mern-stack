import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';
import type { LocalizedString } from '../../../shared/types/i18n';

const productOptionSelectionSchema = new Schema(
  {
    optionId: { type: Schema.Types.ObjectId, required: true, ref: 'Option' },
    valueKeys: { type: [String], default: [] },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    sku: { type: String, required: false, unique: true, sparse: true, trim: true },

    name: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, required: true, default: { ar: '', en: '' } },

    // Store as Decimal128 major units (e.g. 12.99).
    price: { type: Schema.Types.Decimal128, required: true },

    categoryIds: { type: [Schema.Types.ObjectId], default: [], ref: 'Category' },
    optionIds: { type: [Schema.Types.ObjectId], default: [], ref: 'Option' },
    options: { type: [productOptionSelectionSchema], default: [] },

    images: { type: [String], default: [] },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    if (obj.price != null) {
      // Decimal128 serializes as {"$numberDecimal": "..."} sometimes; normalize.
      const raw = obj.price?.toString?.() ?? obj.price;
      const n = typeof raw === 'string' ? Number(raw) : raw;
      obj.price = Number.isFinite(n) ? n : 0;
    }
    return obj;
  },
});

export type Product = InferSchemaType<typeof productSchema> & {
  name: LocalizedString;
  description: LocalizedString;
  categoryIds: Types.ObjectId[];
  optionIds: Types.ObjectId[];
  options: Array<{ optionId: Types.ObjectId; valueKeys: string[] }>;
  price: any;
  isFeatured: boolean;
};

export const ProductModel =
  (mongoose.models.Product as mongoose.Model<Product> | undefined) ||
  mongoose.model<Product>('Product', productSchema);
