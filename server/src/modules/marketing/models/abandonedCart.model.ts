import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    quantity: { type: Number, required: true, min: 1 },
    selections: {
      type: [
        {
          optionId: { type: Schema.Types.ObjectId, required: true },
          valueKeys: { type: [String], default: [] },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const abandonedCartSchema = new Schema(
  {
    sessionKey: { type: String, required: true, unique: true, trim: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    items: { type: [cartItemSchema], default: [] },
    currencyCode: { type: String, default: 'USD' },
    lastReminderAt: { type: Date },
    remindersSent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

abandonedCartSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type AbandonedCart = InferSchemaType<typeof abandonedCartSchema> & {
  customerId?: Types.ObjectId;
};

export const AbandonedCartModel =
  (mongoose.models.AbandonedCart as mongoose.Model<AbandonedCart> | undefined) ||
  mongoose.model<AbandonedCart>('AbandonedCart', abandonedCartSchema);
