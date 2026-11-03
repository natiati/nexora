const { z } = require('zod');
const { optionalText, requiredText, emptyToNull, id } = require('./common');

const CreateUserSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(150),
  password: z.string().min(8).max(72),
  firstName: requiredText(80),
  lastName: requiredText(80),
  phone: optionalText(30),
  avatarUrl: emptyToNull(z.string().trim().url().max(500).nullish()),
  roleId: id()
});

// El correo no se cambia; la contraseña solo se envía si se quiere restablecer
const UpdateUserSchema = CreateUserSchema.omit({ email: true, password: true }).partial().extend({
  password: z.preprocess((value) => (value === '' || value === null ? undefined : value), z.string().min(8).max(72).optional()),
  isActive: z.boolean().optional()
});

module.exports = { CreateUserSchema, UpdateUserSchema };
