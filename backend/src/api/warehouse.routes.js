const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const WarehouseController = require('../controllers/warehouse.controller');

const router = Router();

router.get('/', WarehouseController.list);
router.get('/:id', WarehouseController.get);
router.post('/', requireRole('admin'), WarehouseController.create);
router.put('/:id', requireRole('admin'), WarehouseController.update);

module.exports = router;
