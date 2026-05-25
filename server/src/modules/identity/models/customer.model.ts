import mongoose, { InferSchemaType, Schema } from 'mongoose';

const customerSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
      phone: { type: String, required: false, trim: true },
    passwordHash: { type: String, required: true, select: false },

    resetPasswordTokenHash: { type: String, required: false, select: false },
    resetPasswordExpiresAt: { type: Date, required: false, select: false },
    wishlistProductIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
  },
  { timestamps: true }
);

customerSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    delete obj.passwordHash;
    delete obj.resetPasswordTokenHash;
    delete obj.resetPasswordExpiresAt;
    if (Array.isArray(obj.wishlistProductIds)) {
      obj.wishlistProductIds = obj.wishlistProductIds.map((x: any) => x?.toString?.() ?? x);
    }
    return obj;
  },
});

export type Customer = InferSchemaType<typeof customerSchema>;

export const CustomerModel =
  (mongoose.models.Customer as mongoose.Model<Customer> | undefined) ||
  mongoose.model<Customer>('Customer', customerSchema);
