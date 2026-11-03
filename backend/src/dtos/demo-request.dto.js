const { z } = require('zod');
const { requiredText } = require('./common');

const CreateDemoRequestSchema = z.object({
  name: requiredText(120),
  company: requiredText(150),
  email: z.string().trim().toLowerCase().email().max(150)
});

module.exports = { CreateDemoRequestSchema };
