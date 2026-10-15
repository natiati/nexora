const { z } = require('zod');

const CreateCustomerSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(150),
  email: z.string().email().max(150).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional()
});

module.exports = { CreateCustomerSchema };
// es dto porq no tiene res, req, next, y hace parte de models porq tiene CustomerModel
// y no toca la base de datos, solo valida los datos que vienen del front