const { Router } = require('express');
const InvoiceController = require('../controllers/invoice.controller');
const router = Router();

router.post('/', InvoiceController.create);
router.get('/', InvoiceController.list);
router.post('/:id/payments', InvoiceController.registerPayment);

module.exports = router;