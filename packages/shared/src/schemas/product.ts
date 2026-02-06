import { z } from 'zod';
import { MEASUREMENT_UNITS } from '../constants/measurementUnits';

export const productStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const measurementUnitEnum = z.enum(MEASUREMENT_UNITS as unknown as [string, ...string[]]);

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  measurementUnit: measurementUnitEnum,
  price: z.number().min(0, 'Price must be non-negative'),
  status: productStatusEnum.default('ACTIVE'),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
