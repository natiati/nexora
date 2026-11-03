const { Router } = require('express');
const StockController = require('../controllers/stock.controller');

const router = Router();

router.get('/', StockController.list);
router.get('/movements', StockController.listMovements);
router.post('/adjust', StockController.adjust);

module.exports = router;
