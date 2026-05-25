import { z } from 'zod';
import { LocalizedStringSchema } from '../../../shared/utils/zodLocalizedString';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const ShippingCountryCreateSchema = z.object({
  name: LocalizedStringSchema,
  taxFee: z.number().min(0).max(1_000_000_000).optional(),
  isActive: z.boolean().optional(),
});

export const ShippingCountryUpdateSchema = ShippingCountryCreateSchema.partial();

export const ShippingCityCreateSchema = z.object({
  countryId: objectId,
  name: LocalizedStringSchema,
  price: z.number().min(0).max(1_000_000_000),
  isActive: z.boolean().optional(),
});

export const ShippingCityUpdateSchema = ShippingCityCreateSchema.partial().omit({ countryId: true });

