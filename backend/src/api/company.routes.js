const { Router } = require('express');
const { requireRole } = require('../../middleware/auth');
const CompanyController = require('../controllers/company.controller');

const router = Router();

router.get('/', CompanyController.get);
router.put('/', requireRole('admin'), CompanyController.update);

module.exports = router;
