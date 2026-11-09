const { Router } = require('express');
const http = require('./http-adapter');
const CategoryController = require('../controllers/category.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.get('/', http((req) => CategoryController.list(req.user.companyId, req.query)));
router.get('/:id', http((req) => CategoryController.get(req.user.companyId, req.params.id)));
router.post('/', http((req) => CategoryController.create(req.user.companyId, req.body)));
router.put('/:id', http((req) => CategoryController.update(req.user.companyId, req.params.id, req.body)));
router.delete('/:id', http((req) => CategoryController.remove(req.user.companyId, req.params.id)));

module.exports = router;
