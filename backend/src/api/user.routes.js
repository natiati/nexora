const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const UserController = require('../controllers/user.controller');

const router = Router();

router.use(requireRole('admin'));

router.get('/', UserController.list);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.remove);

module.exports = router;
