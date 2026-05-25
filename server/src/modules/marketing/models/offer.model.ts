import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';

const offerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    targetType: { type: String, required: true, enum: ['product', 'collection', 'category'] },
    targetIds: { type: [{ type: Schema.Types.ObjectId }], required: true, default: [] },
    percentOff: { type: Number, min: 1, max: 100 },
    fixedOff: { type: Schema.Types.Decimal128, min: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

offerSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    if (Array.isArray(obj.targetIds)) {
      obj.targetIds = obj.targetIds.map((x: any) => x?.toString?.() ?? x);
    }
    if (obj.fixedOff != null) {
      const raw = obj.fixedOff?.toString?.() ?? obj.fixedOff;
      const n = typeof raw === 'string' ? Number(raw) : Number(raw);
      obj.fixedOff = Number.isFinite(n) ? n : 0;
    }
    return obj;
  },
});

export type Offer = InferSchemaType<typeof offerSchema> & {
  targetType: 'product' | 'collection' | 'category';
  targetIds: Types.ObjectId[];
};

export const OfferModel =
  (mongoose.models.Offer as mongoose.Model<Offer> | undefined) ||
  mongoose.model<Offer>('Offer', offerSchema);
