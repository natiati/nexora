const { z } = require('zod');

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100),
  q: z.string().trim().max(100).optional()
});

// Convierte ?page=2&limit=20&q=texto en { skip, take, q } para los services
function parsePagination(query) {
  const { page, limit, q } = PaginationSchema.parse(query);
  return { skip: (page - 1) * limit, take: limit, q: q || undefined };
}

module.exports = { parsePagination };
