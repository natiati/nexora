const { Router } = require('express');
const http = require('./http-adapter');
const SalesOrderController = require('../controllers/sales-order.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.post('/', http((req) => SalesOrderController.create(req.user.companyId, req.user.id, req.body)));
router.get('/', http((req) => SalesOrderController.list(req.user.companyId, req.query)));
router.get('/:id', http((req) => SalesOrderController.get(req.user.companyId, req.params.id)));
router.post('/:id/confirm', http((req) => SalesOrderController.confirm(req.user.companyId, req.params.id)));
router.post('/:id/deliver', http((req) => SalesOrderController.deliver(req.user.companyId, req.params.id, req.user.id)));
router.post('/:id/cancel', http((req) => SalesOrderController.cancel(req.user.companyId, req.params.id)));

module.exports = router;
