import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';

const campaignSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: '' },
    couponIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Coupon' }], default: [] },
    offerIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Offer' }], default: [] },
    startsAt: { type: Date },
    endsAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

campaignSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type Campaign = InferSchemaType<typeof campaignSchema> & {
  couponIds: Types.ObjectId[];
  offerIds: Types.ObjectId[];
};

export const CampaignModel =
  (mongoose.models.Campaign as mongoose.Model<Campaign> | undefined) ||
  mongoose.model<Campaign>('Campaign', campaignSchema);
