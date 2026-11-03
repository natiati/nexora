const { z } = require('zod');
const { optionalLongText, id } = require('./common');

const AdjustStockSchema = z.object({
  productId: id(),
  warehouseId: id(),
  // Positivo = entrada, negativo = salida
  quantity: z.coerce.number().min(-99999999999.999).max(99999999999.999)
    .refine((n) => n !== 0, 'La cantidad no puede ser 0'),
  notes: optionalLongText()
});

module.exports = { AdjustStockSchema };
