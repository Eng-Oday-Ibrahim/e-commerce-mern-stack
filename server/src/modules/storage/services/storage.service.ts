import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { AppError } from '../../../shared/middleware/errorHandler';
import { randomToken } from '../../../shared/utils/crypto';

function safeBaseName(name: string): string {
  return name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 80);
}

function normalizeImageBaseName(filename?: string): string {
  const raw = path.basename(filename || 'image');
  let base = raw;
  const known = ['.png', '.jpg', '.jpeg', '.webp'];
  let changed = true;
  while (changed) {
    changed = false;
    for (const k of known) {
      if (base.toLowerCase().endsWith(k)) {
        base = base.slice(0, -k.length);
        changed = true;
      }
    }
  }
  return base || 'image';
}

export async function saveBase64Image(input: {
  folder: 'products' | 'collections' | 'lookbooks' | 'hero';
  filename?: string;
  mimeType?: string;
  contentBase64: string;
}) {
  const storageRoot = path.join(process.cwd(), 'storage');
  const folderPath = path.join(storageRoot, input.folder);

  const base = safeBaseName(normalizeImageBaseName(input.filename));
  const name = `${Date.now()}-${randomToken(6)}-${base}.webp`;
  const filePath = path.join(folderPath, name);

  const rawBuf = Buffer.from(input.contentBase64, 'base64');
  if (!rawBuf.length) throw new AppError('Invalid file', 400, 'validation_error');
  if (rawBuf.length > 5 * 1024 * 1024) throw new AppError('File too large', 413, 'payload_too_large');

  const mime = (input.mimeType || '').toLowerCase();
  if (mime && !mime.startsWith('image/')) {
    throw new AppError('Unsupported file type', 400, 'validation_error');
  }

  let outBuf: Buffer;
  try {
    outBuf = await sharp(rawBuf, { failOn: 'error' })
      .rotate()
      .webp({ lossless: true, effort: 4 })
      .toBuffer();
  } catch {
    throw new AppError('Invalid image', 400, 'validation_error');
  }

  await fs.mkdir(folderPath, { recursive: true });
  await fs.writeFile(filePath, outBuf);

  return { url: `/storage/${input.folder}/${name}` };
}
