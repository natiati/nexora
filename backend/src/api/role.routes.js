const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const RoleController = require('../controllers/role.controller');

const router = Router();

router.use(requireRole('admin'));

router.get('/', RoleController.list);
router.get('/:id', RoleController.get);
router.post('/', RoleController.create);
router.put('/:id', RoleController.update);
router.delete('/:id', RoleController.remove);

module.exports = router;
