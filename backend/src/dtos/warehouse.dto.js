const { z } = require('zod');
const { optionalText, optionalLongText, requiredText } = require('./common');

const CreateWarehouseSchema = z.object({
  name: requiredText(120),
  code: optionalText(20),
  address: optionalLongText(),
  isDefault: z.boolean().optional()
});

const UpdateWarehouseSchema = CreateWarehouseSchema.partial().extend({
  isActive: z.boolean().optional()
});

module.exports = { CreateWarehouseSchema, UpdateWarehouseSchema };
