const { Router } = require('express');
const DashboardController = require('../controllers/dashboard.controller');

const router = Router();

router.get('/', DashboardController.summary);

module.exports = router;
