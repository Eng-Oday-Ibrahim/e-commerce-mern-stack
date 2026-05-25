import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';
import type { LocalizedString } from '../../../shared/types/i18n';

const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, required: true, default: { ar: '', en: '' } },
    imageUrl: { type: String, required: false, trim: true },

    parentCategoryId: { type: Schema.Types.ObjectId, required: false, ref: 'Category' },

    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type Category = InferSchemaType<typeof categorySchema> & {
  name: LocalizedString;
  description: LocalizedString;
  imageUrl?: string;
  parentCategoryId?: Types.ObjectId;
};

export const CategoryModel =
  (mongoose.models.Category as mongoose.Model<Category> | undefined) ||
  mongoose.model<Category>('Category', categorySchema);
