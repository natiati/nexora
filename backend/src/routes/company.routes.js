const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const http = require('./http-adapter');
const CompanyController = require('../controllers/company.controller');

// Rutas: URL + permisos. Sacan de la petición los datos y se los pasan al controlador.
const router = Router();

router.get('/', http((req) => CompanyController.get(req.user.companyId)));
router.put('/', requireRole('admin'), http((req) => CompanyController.update(req.user.companyId, req.body)));

module.exports = router;
