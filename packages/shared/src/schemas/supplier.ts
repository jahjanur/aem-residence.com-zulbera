import { z } from 'zod';

export const supplierStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const createSupplierSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  status: supplierStatusEnum.default('ACTIVE'),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
