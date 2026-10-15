const { z } = require('zod');

const CreateSupplierSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(150),
  email: z.string().email().max(150).optional(),
  phone: z.string().max(30).optional(),
  contactName: z.string().max(120).optional()
});

module.exports = { CreateSupplierSchema };
