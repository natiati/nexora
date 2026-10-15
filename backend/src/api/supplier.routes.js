const { Router } = require('express');
const SupplierController = require('../controllers/supplier.controller');
const router = Router();

router.get('/', SupplierController.list);
router.post('/', SupplierController.create);

module.exports = router;