const { Router } = require('express');
const CustomerController = require('../controllers/customer.controller');

const router = Router();

router.get('/', CustomerController.list);
router.get('/:id', CustomerController.get);
router.post('/', CustomerController.create);
router.put('/:id', CustomerController.update);
router.delete('/:id', CustomerController.remove);
router.get('/:id/interactions', CustomerController.listInteractions);
router.post('/:id/interactions', CustomerController.addInteraction);

module.exports = router;
