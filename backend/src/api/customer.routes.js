const { Router } = require('express');
const CustomerController = require('../controllers/customer.controller');
const router = Router();

router.get('/', CustomerController.list);
router.post('/', CustomerController.create);

module.exports = router;