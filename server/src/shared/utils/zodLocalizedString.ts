import { z } from 'zod';

export const LocalizedStringSchema = z
  .object({
    ar: z.string().min(1).max(2000),
    en: z.string().min(1).max(2000),
  })
  .strict();

