const { z } = require('zod');

const LoginSchema = z.object({
  email: z.string().email().max(150),
  password: z.string().min(1)
});

module.exports = { LoginSchema };