const { Router } = require('express');
const http = require('./http-adapter');
const InvoiceController = require('../controllers/invoice.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.post('/', http((req) => InvoiceController.create(req.user.companyId, req.user.id, req.body)));
router.get('/', http((req) => InvoiceController.list(req.user.companyId, req.query)));
router.get('/:id', http((req) => InvoiceController.get(req.user.companyId, req.params.id)));
router.post('/:id/payments', http((req) => InvoiceController.registerPayment(req.user.companyId, req.params.id, req.user.id, req.body)));
router.post('/:id/cancel', http((req) => InvoiceController.cancel(req.user.companyId, req.params.id)));

module.exports = router;
