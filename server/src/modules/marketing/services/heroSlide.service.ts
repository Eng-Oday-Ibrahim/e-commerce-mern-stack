import { AppError } from '../../../shared/middleware/errorHandler';
import { HeroSlideModel } from '../models/heroSlide.model';

export async function listHeroSlidesAdmin() {
  return HeroSlideModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
}

export async function getHeroSlideAdmin(id: string) {
  const doc = await HeroSlideModel.findById(id);
  if (!doc) throw new AppError('Hero slide not found', 404, 'not_found');
  return doc;
}

export async function createHeroSlide(input: {
  eyebrow: Record<'ar' | 'en', string>;
  line1: Record<'ar' | 'en', string>;
  line2: Record<'ar' | 'en', string>;
  sub: Record<'ar' | 'en', string>;
  cta: Record<'ar' | 'en', string>;
  ctaHref: string;
  image: string;
  published?: boolean;
  sortOrder?: number;
}) {
  const top = await HeroSlideModel.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
  const sortOrder = input.sortOrder ?? ((top?.sortOrder ?? 0) + 10);
  return HeroSlideModel.create({ ...input, sortOrder });
}

export async function patchHeroSlide(id: string, patch: Partial<{
  eyebrow: Record<'ar' | 'en', string>;
  line1: Record<'ar' | 'en', string>;
  line2: Record<'ar' | 'en', string>;
  sub: Record<'ar' | 'en', string>;
  cta: Record<'ar' | 'en', string>;
  ctaHref: string;
  image: string;
  published: boolean;
  sortOrder: number;
}>) {
  const $set: any = {};
  for (const key of Object.keys(patch) as Array<keyof typeof patch>) {
    const value = patch[key];
    if (value !== undefined) $set[key] = value;
  }

  const doc = await HeroSlideModel.findByIdAndUpdate(id, $set, { new: true });
  if (!doc) throw new AppError('Hero slide not found', 404, 'not_found');
  return doc;
}

export async function deleteHeroSlide(id: string) {
  const doc = await HeroSlideModel.findByIdAndDelete(id);
  if (!doc) throw new AppError('Hero slide not found', 404, 'not_found');
}

export async function listHeroSlidesPublic() {
  return HeroSlideModel.find({ published: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
}
