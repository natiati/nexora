const { z } = require('zod');
const { optionalText, optionalLongText, optionalEmail, optionalDate, requiredText, emptyToNull, money } = require('./common');

// Solo valida y tipa los datos que llegan del cliente; no usa req/res ni toca la base de datos.
// companyId no se acepta: siempre sale del usuario autenticado.
const CreateCustomerSchema = z.object({
  code: optionalText(30),
  name: requiredText(150),
  taxId: optionalText(30),
  email: optionalEmail(),
  phone: optionalText(30),
  address: optionalLongText(),
  city: optionalText(100),
  creditLimit: emptyToNull(money().nullish()),
  paymentTerms: optionalText(50),
  notes: optionalLongText()
});

const UpdateCustomerSchema = CreateCustomerSchema.partial().extend({
  isActive: z.boolean().optional()
});

const CreateInteractionSchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'visit', 'note']),
  subject: optionalText(200),
  content: requiredText(5000),
  interactionDate: optionalDate()
});

module.exports = { CreateCustomerSchema, UpdateCustomerSchema, CreateInteractionSchema };
