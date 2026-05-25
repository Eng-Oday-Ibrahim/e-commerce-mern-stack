import { Schema } from 'mongoose';
import type { LocalizedString } from '../types/i18n';

export const localizedStringSchema = new Schema<LocalizedString>(
  {
    ar: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  { _id: false }
);

