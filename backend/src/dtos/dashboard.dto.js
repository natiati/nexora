const { z } = require('zod');

const DashboardQuerySchema = z.object({
  months: z.coerce.number().refine((n) => [3, 6, 12].includes(n), 'Debe ser 3, 6 o 12').default(6)
});

module.exports = { DashboardQuerySchema };
