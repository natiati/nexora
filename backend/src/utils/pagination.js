const { z } = require('zod');

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100)
});

// Convierte ?page=2&limit=20 en { skip, take } para Prisma
function parsePagination(query) {
  const { page, limit } = PaginationSchema.parse(query);
  return { skip: (page - 1) * limit, take: limit };
}

module.exports = { parsePagination };