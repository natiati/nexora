const jwt = require('jsonwebtoken');
const AuthService = require('../src/services/auth.service');
const AppError = require('../src/utils/app-error');

// Verifica el JWT y resuelve el usuario, su empresa y su rol.
// Se consulta la base en cada petición para que desactivar a un usuario tenga efecto de inmediato.
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // El usuario y la empresa salen del token firmado, nunca del cuerpo de la petición
  req.user = await AuthService.resolveSession(payload.userId, payload.pv);
  next();
}

// Restringe una ruta a ciertos roles. Uso: router.post('/', requireRole('admin'), ...)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('No tienes permisos para realizar esta acción', 403);
    }
    next();
  };
}

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
