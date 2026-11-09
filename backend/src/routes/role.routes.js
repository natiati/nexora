const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const http = require('./http-adapter');
const RoleController = require('../controllers/role.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

// Solo el administrador gestiona roles
router.use(requireRole('admin'));

router.get('/', http((req) => RoleController.list(req.user.companyId, req.query)));
router.get('/:id', http((req) => RoleController.get(req.user.companyId, req.params.id)));
router.post('/', http((req) => RoleController.create(req.user.companyId, req.body)));
router.put('/:id', http((req) => RoleController.update(req.user.companyId, req.params.id, req.body)));
router.delete('/:id', http((req) => RoleController.remove(req.user.companyId, req.params.id)));

module.exports = router;
