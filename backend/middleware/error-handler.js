const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }))
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(409).json({ error: 'El registro ya existe (violación de unicidad)' });
  }

  console.error(err);
  res.status(500).json({ error: 'Ocurrió un error inesperado, intente nuevamente' });
}

module.exports = errorHandler;