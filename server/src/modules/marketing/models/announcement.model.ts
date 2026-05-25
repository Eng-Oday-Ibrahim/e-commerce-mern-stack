import mongoose, { InferSchemaType, Schema } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';

const announcementSchema = new Schema(
  {
    message: { type: localizedStringSchema, required: true },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

announcementSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type Announcement = InferSchemaType<typeof announcementSchema>;

export const AnnouncementModel =
  (mongoose.models.Announcement as mongoose.Model<Announcement> | undefined) ||
  mongoose.model<Announcement>('Announcement', announcementSchema);
