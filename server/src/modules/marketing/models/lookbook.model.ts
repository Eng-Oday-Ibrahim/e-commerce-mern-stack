import mongoose, { InferSchemaType, Schema } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';

const optionalLocalizedStringSchema = new Schema(
  {
    ar: { type: String, trim: true, default: '' },
    en: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const lookbookSchema = new Schema(
  {
    title: { type: localizedStringSchema, required: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: optionalLocalizedStringSchema, default: () => ({ ar: '', en: '' }) },
    coverImage: { type: String, trim: true },
    linkedProductId: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
    season: { type: String, trim: true, maxlength: 80 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

lookbookSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type Lookbook = InferSchemaType<typeof lookbookSchema>;

export const LookbookModel =
  (mongoose.models.Lookbook as mongoose.Model<Lookbook> | undefined) ||
  mongoose.model<Lookbook>('Lookbook', lookbookSchema);
