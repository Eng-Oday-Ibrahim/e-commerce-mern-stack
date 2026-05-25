import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';

const stockItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'Product' },
    onHandQty: { type: Number, required: true, min: 0, default: 0 },
    reservedQty: { type: Number, required: true, min: 0, default: 0 },
    availableQty: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

stockItemSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type StockItem = InferSchemaType<typeof stockItemSchema> & {
  productId: Types.ObjectId;
};

export const StockItemModel =
  (mongoose.models.StockItem as mongoose.Model<StockItem> | undefined) ||
  mongoose.model<StockItem>('StockItem', stockItemSchema);
