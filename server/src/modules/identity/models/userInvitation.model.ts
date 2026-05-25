import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';

const userInvitationSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },

    invitedByUserId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    tokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },

    acceptedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

userInvitationSchema.index({ email: 1 });
userInvitationSchema.index({ tokenHash: 1 });

userInvitationSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    delete obj.tokenHash;
    return obj;
  },
});

export type UserInvitation = InferSchemaType<typeof userInvitationSchema> & {
  invitedByUserId: Types.ObjectId;
};

export const UserInvitationModel =
  (mongoose.models.UserInvitation as mongoose.Model<UserInvitation> | undefined) ||
  mongoose.model<UserInvitation>('UserInvitation', userInvitationSchema);
