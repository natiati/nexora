const { Router } = require('express');
const CategoryController = require('../controllers/category.controller');

const router = Router();

router.get('/', CategoryController.list);
router.get('/:id', CategoryController.get);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.remove);

module.exports = router;
