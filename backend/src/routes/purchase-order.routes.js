const { Router } = require('express');
const http = require('./http-adapter');
const PurchaseOrderController = require('../controllers/purchase-order.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.post('/', http((req) => PurchaseOrderController.create(req.user.companyId, req.user.id, req.body)));
router.get('/', http((req) => PurchaseOrderController.list(req.user.companyId, req.query)));
router.get('/:id', http((req) => PurchaseOrderController.get(req.user.companyId, req.params.id)));
router.post('/:id/receive', http((req) => PurchaseOrderController.receive(req.user.companyId, req.params.id, req.user.id)));
router.post('/:id/cancel', http((req) => PurchaseOrderController.cancel(req.user.companyId, req.params.id)));

module.exports = router;
