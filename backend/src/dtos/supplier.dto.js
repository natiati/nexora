const { z } = require('zod');
const { optionalText, optionalLongText, optionalEmail, requiredText } = require('./common');

const CreateSupplierSchema = z.object({
  name: requiredText(150),
  taxId: optionalText(30),
  email: optionalEmail(),
  phone: optionalText(30),
  address: optionalLongText(),
  contactName: optionalText(120),
  notes: optionalLongText()
});

const UpdateSupplierSchema = CreateSupplierSchema.partial().extend({
  isActive: z.boolean().optional()
});

module.exports = { CreateSupplierSchema, UpdateSupplierSchema };
