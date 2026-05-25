import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { StorageUploadSchema } from '../validators/storage.validator';
import { saveBase64Image } from '../services/storage.service';

export const upload = asyncHandler(async (req: Request, res: Response) => {
  const body = StorageUploadSchema.parse(req.body);
  const result = await saveBase64Image(body);
  res.status(201).json({ ok: true, ...result });
});

