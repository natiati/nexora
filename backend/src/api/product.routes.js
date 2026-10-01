const { Router } = require('express');
const ProductController = require('../controllers/product.controller');
const router = Router();

router.get('/', ProductController.list);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);

module.exports = router;