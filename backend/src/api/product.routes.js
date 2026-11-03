const { Router } = require('express');
const ProductController = require('../controllers/product.controller');

const router = Router();

router.get('/', ProductController.list);
router.get('/:id', ProductController.get);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.remove);

module.exports = router;
