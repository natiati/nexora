const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/auth.controller');

const router = Router();

// Máximo 10 intentos de login por IP cada 15 minutos (frena fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, intente de nuevo en 15 minutos' }
});

// Recuperar contraseña: 5 solicitudes por IP cada hora, para no saturar el correo de nadie
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' }
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, intente de nuevo en 15 minutos' }
});

router.post('/login', loginLimiter, AuthController.login);
router.post('/password/forgot', forgotLimiter, AuthController.forgotPassword);
router.post('/password/reset', resetLimiter, AuthController.resetPassword);

module.exports = router;
