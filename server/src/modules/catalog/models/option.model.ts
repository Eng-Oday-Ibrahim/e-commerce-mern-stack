import mongoose, { InferSchemaType, Schema } from 'mongoose';
import { localizedStringSchema } from '../../../shared/utils/mongooseLocalizedString';
import type { LocalizedString } from '../../../shared/types/i18n';

const optionValueSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: false, trim: true },
    hex: { type: String, required: false, trim: true },
  },
  { _id: false }
);

const optionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: localizedStringSchema, required: true },
    type: { type: String, required: true, enum: ['text', 'color'], default: 'text' },
    values: { type: [optionValueSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

optionSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const obj = ret as any;
    obj.id = obj._id?.toString?.() ?? obj._id;
    delete obj._id;
    return obj;
  },
});

export type Option = InferSchemaType<typeof optionSchema> & {
  name: LocalizedString;
  type: 'text' | 'color';
  values: Array<{ key: string; value?: string; hex?: string }>;
};

export const OptionModel =
  (mongoose.models.Option as mongoose.Model<Option> | undefined) ||
  mongoose.model<Option>('Option', optionSchema);
