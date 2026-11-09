const { Router } = require('express');
const http = require('./http-adapter');
const CustomerController = require('../controllers/customer.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.get('/', http((req) => CustomerController.list(req.user.companyId, req.query)));
router.get('/:id', http((req) => CustomerController.get(req.user.companyId, req.params.id)));
router.post('/', http((req) => CustomerController.create(req.user.companyId, req.body)));
router.put('/:id', http((req) => CustomerController.update(req.user.companyId, req.params.id, req.body)));
router.delete('/:id', http((req) => CustomerController.remove(req.user.companyId, req.params.id)));
router.get('/:id/interactions', http((req) => CustomerController.listInteractions(req.user.companyId, req.params.id)));
router.post('/:id/interactions', http((req) => CustomerController.addInteraction(req.user.companyId, req.params.id, req.user.id, req.body)));

module.exports = router;
