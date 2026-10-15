const { Router } = require('express');
const PurchaseOrderController = require('../controllers/purchase-order.controller');
const router = Router();

router.post('/', PurchaseOrderController.create);
router.get('/', PurchaseOrderController.list);
router.post('/:id/receive', PurchaseOrderController.receive);

module.exports = router;