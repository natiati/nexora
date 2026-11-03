// middleware/error-handler.js
const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const AppError = require('../src/utils/app-error');

function errorHandler(err, req, res, next) {
  // Errores de negocio lanzados por los services (404, 409, 400...)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Datos que no cumplen el DTO
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }))
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'El registro ya existe (violación de unicidad)' });
    }
    if (err.code === 'P2003') {
      return res.status(404).json({ error: 'Un registro referenciado no existe' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    if (err.code === 'P2000' || err.code === 'P2020') {
      return res.status(400).json({ error: 'Un valor supera el tamaño permitido' });
    }
  }

  // Cuerpo que no es JSON válido o que supera el límite de express.json()
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es válido' });
  }

  console.error(err);
  res.status(500).json({ error: 'Ocurrió un error inesperado, intente nuevamente' });
}

module.exports = errorHandler;
