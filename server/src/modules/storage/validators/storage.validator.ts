import { z } from 'zod';

export const StorageUploadSchema = z.object({
  folder: z.enum(['products', 'collections', 'lookbooks', 'hero']),
  filename: z.string().min(1).max(200).optional(),
  mimeType: z.string().min(1).max(100).optional(),
  contentBase64: z.string().min(1),
});
