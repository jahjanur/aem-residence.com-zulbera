import { z } from 'zod';

export const inventoryAdjustSchema = z.object({
  productId: z.string().uuid(),
  deltaQty: z.number().int(),
  reason: z.string().min(1, 'Reason is required'),
});

export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;
