import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().uuid().nullable(),
  name: z.string().min(1, 'Item name is required'),
  unit: z.string().min(1, 'Unit is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID'),
  orderDate: z.string().min(1),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'DELIVERED', 'RECONCILED']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
