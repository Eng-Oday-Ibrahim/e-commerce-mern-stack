import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import {
  CollectionCreateSchema,
  CollectionUpdateSchema,
} from '../validators/collection.validator';
import {
  createCollection,
  getCollectionAdminById,
  getCollectionById,
  listAllCollections,
  listPublicCollections,
  updateCollection,
  deleteCollection,
} from '../services/collection.service';

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const collections = await listPublicCollections();
  res.json({ ok: true, collections });
});

export const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const collections = await listAllCollections();
  res.json({ ok: true, collections });
});

export const getPublicById = asyncHandler(async (req: Request, res: Response) => {
  const collectionId = req.params.id as string;
  const collection = await getCollectionById(collectionId);
  if (!collection.isActive) {
    res.status(404).json({ ok: false, code: 'not_found', message: 'Collection not found' });
    return;
  }
  res.json({ ok: true, collection });
});

export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const collectionId = req.params.id as string;
  const collection = await getCollectionAdminById(collectionId);
  res.json({ ok: true, collection });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = CollectionCreateSchema.parse(req.body);
  const collection = await createCollection(body);
  res.status(201).json({ ok: true, collection: collection.toJSON() });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const body = CollectionUpdateSchema.parse(req.body);
  const collectionId = req.params.id as string;
  const collection = await updateCollection(collectionId, body);
  res.json({ ok: true, collection: collection.toJSON() });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteCollection(req.params.id as string);
  res.json({ ok: true });
});
