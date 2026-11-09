const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const http = require('./http-adapter');
const UserController = require('../controllers/user.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

// Solo el administrador gestiona usuarios
router.use(requireRole('admin'));

router.get('/', http((req) => UserController.list(req.user.companyId, req.query)));
router.post('/', http((req) => UserController.create(req.user.companyId, req.body)));
router.put('/:id', http((req) => UserController.update(req.user.companyId, req.params.id, req.user.id, req.body)));
router.delete('/:id', http((req) => UserController.remove(req.user.companyId, req.params.id, req.user.id)));

module.exports = router;
