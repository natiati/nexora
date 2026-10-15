const { Router } = require('express');
const SalesOrderController = require('../controllers/sales-order.controller');
const router = Router();

router.post('/', SalesOrderController.create);
router.get('/', SalesOrderController.list);
router.post('/:id/confirm', SalesOrderController.confirm);

module.exports = router;