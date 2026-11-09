// Error con código HTTP, para reglas de negocio (404, 409, 400, 503...)
class AppError extends Error {
  /** @param {string} message  Mensaje legible para el cliente
   *  @param {number} [statusCode=400]  Código HTTP de la respuesta */
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    // Captura el stack desde este constructor hacia arriba (no incluye AppError en la traza)
    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError);
  }
}

module.exports = AppError;