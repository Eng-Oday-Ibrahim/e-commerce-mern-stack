import mongoose, { InferSchemaType, Schema } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';

const optionalLocalizedStringSchema = new Schema(
  {
    ar: { type: String, trim: true, default: '' },
    en: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const hotspotSchema = new Schema(
  {
    x: { type: Number, required: true, min: 0, max: 100 },
    y: { type: Number, required: true, min: 0, max: 100 },
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
  },
  { _id: false }
);

const lookbookItemSchema = new Schema(
  {
    lookbookId: { type: Schema.Types.ObjectId, required: true, ref: 'Lookbook', index: true },
    image: { type: String, required: true, trim: true },
    caption: { type: optionalLocalizedStringSchema, default: () => ({ ar: '', en: '' }) },
    sortOrder: { type: Number, default: 0 },
    linkedProducts: { type: [Schema.Types.ObjectId], default: [], ref: 'Product' },
    hotspots: { type: [hotspotSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

lookbookItemSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    obj.lookbookId = obj.lookbookId?.toString?.() ?? obj.lookbookId;
    obj.linkedProducts = (obj.linkedProducts ?? []).map((x: any) => x?.toString?.() ?? x);
    return obj;
  },
});

export type LookbookItem = InferSchemaType<typeof lookbookItemSchema>;

export const LookbookItemModel =
  (mongoose.models.LookbookItem as mongoose.Model<LookbookItem> | undefined) ||
  mongoose.model<LookbookItem>('LookbookItem', lookbookItemSchema);
