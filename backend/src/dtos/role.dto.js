const { z } = require('zod');
const { optionalLongText, requiredText } = require('./common');

const CreateRoleSchema = z.object({
  name: requiredText(80),
  description: optionalLongText()
});

const UpdateRoleSchema = CreateRoleSchema.partial();

module.exports = { CreateRoleSchema, UpdateRoleSchema };
