const { Router } = require('express');
const http = require('./http-adapter');
const SupplierController = require('../controllers/supplier.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.get('/', http((req) => SupplierController.list(req.user.companyId, req.query)));
router.get('/:id', http((req) => SupplierController.get(req.user.companyId, req.params.id)));
router.post('/', http((req) => SupplierController.create(req.user.companyId, req.body)));
router.put('/:id', http((req) => SupplierController.update(req.user.companyId, req.params.id, req.body)));
router.delete('/:id', http((req) => SupplierController.remove(req.user.companyId, req.params.id)));

module.exports = router;
