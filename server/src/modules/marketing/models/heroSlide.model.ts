import mongoose, { InferSchemaType, Schema } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';

const heroSlideSchema = new Schema(
  {
    eyebrow: { type: localizedStringSchema, required: true },
    line1: { type: localizedStringSchema, required: true },
    line2: { type: localizedStringSchema, required: true },
    sub: { type: localizedStringSchema, required: true },
    cta: { type: localizedStringSchema, required: true },
    ctaHref: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    published: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

heroSlideSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type HeroSlide = InferSchemaType<typeof heroSlideSchema>;

export const HeroSlideModel =
  (mongoose.models.HeroSlide as mongoose.Model<HeroSlide> | undefined) ||
  mongoose.model<HeroSlide>('HeroSlide', heroSlideSchema);
