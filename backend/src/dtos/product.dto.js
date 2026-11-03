const { z } = require('zod');
const { optionalText, optionalLongText, requiredText, id, money } = require('./common');

// Product no tiene companyId en el schema: su empresa se deduce de la categoría
const CreateProductSchema = z.object({
  categoryId: id(),
  unitId: id(),
  sku: requiredText(60),
  barcode: optionalText(50),
  name: requiredText(200),
  description: optionalLongText(),
  costPrice: money(),
  salePrice: money(),
  minStock: z.coerce.number().nonnegative().max(999999999.999).optional(),
  trackStock: z.boolean().optional()
});

const UpdateProductSchema = CreateProductSchema.partial().extend({
  isActive: z.boolean().optional()
});

module.exports = { CreateProductSchema, UpdateProductSchema };
