const { Router } = require('express');
const http = require('./http-adapter');
const DashboardController = require('../controllers/dashboard.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.get('/', http((req) => DashboardController.summary(req.user.companyId, req.query)));

module.exports = router;
