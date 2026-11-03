const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const UnitController = require('../controllers/unit.controller');

const router = Router();

router.get('/', UnitController.list);
router.post('/', requireRole('admin'), UnitController.create);

module.exports = router;
