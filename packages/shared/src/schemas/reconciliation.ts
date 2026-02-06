import { z } from 'zod';

export const reconciliationItemSchema = z.object({
  orderItemId: z.string().uuid(),
  receivedQty: z.number().int().min(0, 'Received quantity cannot be negative'),
});

export const createReconciliationSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  reconciliationDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  notes: z.string().optional(),
  items: z.array(reconciliationItemSchema).min(1, 'At least one item with received quantity is required'),
});

export type CreateReconciliationInput = z.infer<typeof createReconciliationSchema>;
export type ReconciliationItemInput = z.infer<typeof reconciliationItemSchema>;
