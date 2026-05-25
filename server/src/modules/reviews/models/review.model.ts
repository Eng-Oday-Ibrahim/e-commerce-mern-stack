import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product', index: true },
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'Customer', index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    description: { type: String, required: true, trim: true, minlength: 4, maxlength: 8000 },
    status: {
      type: String,
      required: true,
      enum: REVIEW_STATUSES,
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, status: 1 });
reviewSchema.index({ customerId: 1, productId: 1, status: 1 });

reviewSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type Review = InferSchemaType<typeof reviewSchema> & {
  productId: Types.ObjectId;
  customerId: Types.ObjectId;
  status: ReviewStatus;
};

export const ReviewModel =
  (mongoose.models.Review as mongoose.Model<Review> | undefined) ||
  mongoose.model<Review>('Review', reviewSchema);
