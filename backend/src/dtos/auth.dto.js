const { z } = require('zod');

const email = () => z.string().trim().toLowerCase().email().max(150);

const LoginSchema = z.object({
  email: email(),
  password: z.string().min(1).max(200)
});

const ForgotPasswordSchema = z.object({
  email: email()
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1).max(2000),
  password: z.string().min(8).max(72)
});

module.exports = { LoginSchema, ForgotPasswordSchema, ResetPasswordSchema };
