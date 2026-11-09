const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const http = require('./http-adapter');
const WarehouseController = require('../controllers/warehouse.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.get('/', http((req) => WarehouseController.list(req.user.companyId, req.query)));
router.get('/:id', http((req) => WarehouseController.get(req.user.companyId, req.params.id)));
router.post('/', requireRole('admin'), http((req) => WarehouseController.create(req.user.companyId, req.body)));
router.put('/:id', requireRole('admin'), http((req) => WarehouseController.update(req.user.companyId, req.params.id, req.body)));

module.exports = router;
