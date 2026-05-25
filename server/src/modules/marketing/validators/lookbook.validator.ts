import { z } from 'zod';
import { LocalizedStringSchema } from '../../../shared/utils/zodLocalizedString';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const LooseLocalizedStringSchema = z
  .object({
    ar: z.string().max(2000),
    en: z.string().max(2000),
  })
  .strict();
const slug = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const LookbookCreateSchema = z.object({
  title: LocalizedStringSchema,
  slug: slug.optional(),
  description: LooseLocalizedStringSchema,
  coverImage: z.string().trim().max(4000).optional(),
  published: z.boolean().optional(),
  linkedProductId: objectId.nullable().optional(),
});

export const LookbookItemsBulkCreateSchema = z.object({
  items: z
    .array(
      z.object({
        image: z.string().trim().min(1).max(4000),
        caption: LooseLocalizedStringSchema.optional(),
        sortOrder: z.number().int().optional(),
        linkedProducts: z.array(objectId).max(1).optional(),
        hotspots: z
          .array(
            z.object({
              x: z.number().min(0).max(100),
              y: z.number().min(0).max(100),
              productId: objectId,
            })
          )
          .optional(),
      })
    )
    .min(1)
    .max(200),
});

export const LookbookItemPatchSchema = z.object({
  image: z.string().trim().min(1).max(4000).optional(),
  caption: LooseLocalizedStringSchema.optional(),
  sortOrder: z.number().int().optional(),
  linkedProducts: z.array(objectId).max(1).optional(),
  hotspots: z
    .array(
      z.object({
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        productId: objectId,
      })
    )
    .optional(),
});

export const LookbookItemsReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: objectId,
        sortOrder: z.number().int(),
      })
    )
    .min(1)
    .max(500),
});
