import { z } from 'zod';
import { LocalizedStringSchema } from '../../../shared/utils/zodLocalizedString';

export const HeroSlideCreateSchema = z.object({
  eyebrow: LocalizedStringSchema,
  line1: LocalizedStringSchema,
  line2: LocalizedStringSchema,
  sub: LocalizedStringSchema,
  cta: LocalizedStringSchema,
  ctaHref: z.string().trim().min(1).max(4000),
  image: z.string().trim().min(1).max(4000),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const HeroSlidePatchSchema = HeroSlideCreateSchema.partial();
