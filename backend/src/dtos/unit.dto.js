const { z } = require('zod');
const { requiredText } = require('./common');

const CreateUnitSchema = z.object({
  name: requiredText(50),
  abbreviation: requiredText(15)
});

module.exports = { CreateUnitSchema };
