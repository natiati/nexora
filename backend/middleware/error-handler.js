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
      return res.status(400).json({ error: 'Una referencia no existe (llave foránea inválida)' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
  }

  console.error(err);
  res.status(500).json({ error: 'Ocurrió un error inesperado, intente nuevamente' });
}

module.exports = errorHandler;