import mongoose, { InferSchemaType, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },

    passwordHash: { type: String, required: false, select: false },
    isActive: { type: Boolean, default: false },

    resetPasswordTokenHash: { type: String, required: false, select: false },
    resetPasswordExpiresAt: { type: Date, required: false, select: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    delete obj.passwordHash;
    delete obj.resetPasswordTokenHash;
    delete obj.resetPasswordExpiresAt;
    return obj;
  },
});

export type User = InferSchemaType<typeof userSchema>;

export const UserModel =
  (mongoose.models.User as mongoose.Model<User> | undefined) ||
  mongoose.model<User>('User', userSchema);
