const { z } = require('zod');

const CreateProductSchema = z.object({
  categoryId: z.string().uuid(),
  unitId: z.string().uuid(),
  sku: z.string().min(1).max(60),
  name: z.string().min(1).max(200),
  costPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  minStock: z.number().nonnegative().default(0)
  // No incluye companyId: Product no tiene esa columna, así que ya no se acepta
  // en el body aunque el frontend lo siga mandando por ahora (Zod lo ignora).
});

const UpdateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  minStock: z.number().nonnegative().optional()
});

module.exports = { CreateProductSchema, UpdateProductSchema };