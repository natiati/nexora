const { z } = require('zod');

const AdjustStockSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.coerce.number().refine((n) => n !== 0, 'La cantidad no puede ser 0'),
  notes: z.string().optional(),
  
});

module.exports = { AdjustStockSchema };