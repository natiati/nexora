// Middleware de autenticación
// El objetivo de este middleware es verificar que el usuario esté autenticado antes de permitirle acceder a ciertas rutas protegidas. Se espera que el token JWT se envíe en el encabezado de autorización de la solicitud HTTP.

const jwt = require('jsonwebtoken'); // Aqui se importa la libreria q ya usamos para trabajar con JWT

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization; // "Bearer <token>"

  if (!authHeader) {  
    return res.status(401).json({
      error: 'Falta token de autenticación'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload; // { userId, email }

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'     
    });
  }
}

module.exports = authMiddleware;