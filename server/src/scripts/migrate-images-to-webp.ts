import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { connectDb } from '../config/db';
import { ProductModel } from '../modules/catalog/models/product.model';
import { CategoryModel } from '../modules/catalog/models/category.model';
import { CollectionModel } from '../modules/catalog/models/collection.model';
import { LookbookModel } from '../modules/marketing/models/lookbook.model';
import { LookbookItemModel } from '../modules/marketing/models/lookbookItem.model';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const NON_WEBP_EXTS = new Set(['.png', '.jpg', '.jpeg']);

function storageRoot(): string {
  return path.join(process.cwd(), 'storage');
}

function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

function filePathToStorageUrl(filePath: string): string {
  const rel = path.relative(storageRoot(), filePath);
  return `/storage/${toPosix(rel)}`;
}

function withWebpExt(p: string): string {
  const ext = path.extname(p);
  return p.slice(0, -ext.length) + '.webp';
}

function rewriteStorageUrlToWebp(url: string): string {
  return url.replace(/(\/storage\/[^?#]+)\.(png|jpe?g)(?=([?#]|$))/gi, '$1.webp');
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;
    out.push(full);
  }
  return out;
}

async function convertFileToLosslessWebp(filePath: string): Promise<{ changed: boolean; newPath: string }> {
  const ext = path.extname(filePath).toLowerCase();
  const newPath = withWebpExt(filePath);
  if (!NON_WEBP_EXTS.has(ext)) return { changed: false, newPath };

  const rawBuf = await fs.readFile(filePath);
  const outBuf = await sharp(rawBuf, { failOn: 'error' })
    .rotate()
    .webp({ lossless: true, effort: 4 })
    .toBuffer();

  await fs.writeFile(newPath, outBuf);
  await fs.unlink(filePath);
  return { changed: true, newPath };
}

async function updateUrlsInDb(): Promise<{ updates: number }> {
  let updates = 0;

  const categories = await CategoryModel.find({ imageUrl: { $type: 'string' } }).select('_id imageUrl');
  for (const c of categories) {
    const before = c.imageUrl || '';
    const after = rewriteStorageUrlToWebp(before);
    if (after !== before) {
      c.imageUrl = after;
      await c.save();
      updates++;
    }
  }

  const collections = await CollectionModel.find({ imageUrl: { $type: 'string' } }).select('_id imageUrl');
  for (const c of collections) {
    const before = c.imageUrl || '';
    const after = rewriteStorageUrlToWebp(before);
    if (after !== before) {
      c.imageUrl = after;
      await c.save();
      updates++;
    }
  }

  const products = await ProductModel.find({ images: { $type: 'array' } }).select('_id images');
  for (const p of products) {
    const before = (p.images || []).slice();
    const after = before.map((x) => (typeof x === 'string' ? rewriteStorageUrlToWebp(x) : x));
    const changed = before.length !== after.length || before.some((v, i) => v !== after[i]);
    if (changed) {
      p.images = after as any;
      await p.save();
      updates++;
    }
  }

  const lookbooks = await LookbookModel.find({ coverImage: { $type: 'string' } }).select('_id coverImage');
  for (const l of lookbooks) {
    const before = l.coverImage || '';
    const after = rewriteStorageUrlToWebp(before);
    if (after !== before) {
      l.coverImage = after;
      await l.save();
      updates++;
    }
  }

  const items = await LookbookItemModel.find({ image: { $type: 'string' } }).select('_id image');
  for (const i of items) {
    const before = i.image || '';
    const after = rewriteStorageUrlToWebp(before);
    if (after !== before) {
      i.image = after;
      await i.save();
      updates++;
    }
  }

  return { updates };
}

async function main() {
  const root = storageRoot();
  console.log(`[migrate] storage root: ${root}`);

  let scanned = 0;
  let converted = 0;

  try {
    const files = await walk(root);
    scanned = files.length;
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (!NON_WEBP_EXTS.has(ext)) continue;
      const { changed, newPath } = await convertFileToLosslessWebp(f);
      if (changed) {
        converted++;
        console.log(`[file] ${filePathToStorageUrl(f)} -> ${filePathToStorageUrl(newPath)}`);
      }
    }
  } catch (e) {
    console.error('[migrate] failed while converting files', e);
    process.exitCode = 1;
    return;
  }

  try {
    await connectDb();
    const { updates } = await updateUrlsInDb();
    console.log(`[db] updated documents: ${updates}`);
  } catch (e) {
    console.error('[migrate] failed while updating DB URLs', e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }

  console.log(`[done] scanned: ${scanned}, converted: ${converted}`);
}

main().catch((e) => {
  console.error('[migrate] fatal', e);
  process.exit(1);
});

