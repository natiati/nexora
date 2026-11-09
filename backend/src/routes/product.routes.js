const { Router } = require('express');
const http = require('./http-adapter');
const ProductController = require('../controllers/product.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.get('/', http((req) => ProductController.list(req.user.companyId, req.query)));
router.get('/:id', http((req) => ProductController.get(req.user.companyId, req.params.id)));
router.post('/', http((req) => ProductController.create(req.user.companyId, req.body)));
router.put('/:id', http((req) => ProductController.update(req.user.companyId, req.params.id, req.body)));
router.delete('/:id', http((req) => ProductController.remove(req.user.companyId, req.params.id)));

module.exports = router;
