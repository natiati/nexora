const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const http = require('./http-adapter');
const UnitController = require('../controllers/unit.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.get('/', http(() => UnitController.list()));
router.post('/', requireRole('admin'), http((req) => UnitController.create(req.body)));

module.exports = router;
