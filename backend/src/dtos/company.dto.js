const { z } = require('zod');
const { optionalText, optionalLongText, optionalEmail, requiredText } = require('./common');

const UpdateCompanySchema = z.object({
  name: requiredText(150),
  legalName: optionalText(200),
  taxId: optionalText(30),
  email: optionalEmail(),
  phone: optionalText(30),
  address: optionalLongText(),
  city: optionalText(100),
  country: optionalText(80),
  currency: z.string().trim().length(3).toUpperCase(),
  timezone: requiredText(50)
}).partial();

module.exports = { UpdateCompanySchema };
