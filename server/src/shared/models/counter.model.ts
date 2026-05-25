import mongoose, { InferSchemaType, Schema } from 'mongoose';

const counterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export type Counter = InferSchemaType<typeof counterSchema>;

export const CounterModel =
  (mongoose.models.Counter as mongoose.Model<Counter> | undefined) ||
  mongoose.model<Counter>('Counter', counterSchema);

