const { z } = require('zod');
const { optionalLongText, requiredText } = require('./common');

const CreateCategorySchema = z.object({
  name: requiredText(120),
  description: optionalLongText()
});

const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  isActive: z.boolean().optional()
});

module.exports = { CreateCategorySchema, UpdateCategorySchema };
