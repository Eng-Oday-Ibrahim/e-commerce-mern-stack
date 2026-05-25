import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';
import type { LocalizedString } from '../../../shared/types/i18n';

const collectionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, required: true, default: { ar: '', en: '' } },

    productIds: { type: [Schema.Types.ObjectId], default: [], ref: 'Product' },
    imageUrl: { type: String, required: false, trim: true },

    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

collectionSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type Collection = InferSchemaType<typeof collectionSchema> & {
  name: LocalizedString;
  description: LocalizedString;
  productIds: Types.ObjectId[];
};

export const CollectionModel =
  (mongoose.models.Collection as mongoose.Model<Collection> | undefined) ||
  mongoose.model<Collection>('Collection', collectionSchema);
