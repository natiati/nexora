const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../../middleware/auth');
const http = require('./http-adapter');
const DemoRequestController = require('../controllers/demo-request.controller');

const router = Router();

// El formulario es público: máximo 5 solicitudes por IP cada hora (frena el spam)
const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' }
});

router.post('/', requestLimiter, http((req) => DemoRequestController.create(req.body)));
router.get('/', authMiddleware, http((req) => DemoRequestController.list(req.user.companyId, req.query)));

module.exports = router;
