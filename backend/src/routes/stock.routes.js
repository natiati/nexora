const { Router } = require('express');
const http = require('./http-adapter');
const StockController = require('../controllers/stock.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.get('/', http((req) => StockController.list(req.user.companyId, req.query)));
router.get('/movements', http((req) => StockController.listMovements(req.user.companyId, req.query)));
router.post('/adjust', http((req) => StockController.adjust(req.user.companyId, req.user.id, req.body)));

module.exports = router;
