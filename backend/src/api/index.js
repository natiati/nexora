const { Router } = require('express');
const authMiddleware = require('../../middleware/auth');

const router = Router();

// Pública: inicio de sesión
router.use(require('./auth.routes'));

// Pública para enviar (formulario de la landing); consultarlas exige JWT
router.use('/demo-requests', require('./demo-request.routes'));

// Protegidas con JWT: cada ruta trabaja solo con la empresa del usuario autenticado
router.use('/dashboard', authMiddleware, require('./dashboard.routes'));
router.use('/company', authMiddleware, require('./company.routes'));
router.use('/users', authMiddleware, require('./user.routes'));
router.use('/roles', authMiddleware, require('./role.routes'));
router.use('/categories', authMiddleware, require('./category.routes'));
router.use('/units', authMiddleware, require('./unit.routes'));
router.use('/products', authMiddleware, require('./product.routes'));
router.use('/suppliers', authMiddleware, require('./supplier.routes'));
router.use('/customers', authMiddleware, require('./customer.routes'));
router.use('/warehouses', authMiddleware, require('./warehouse.routes'));
router.use('/stock', authMiddleware, require('./stock.routes'));
router.use('/sales-orders', authMiddleware, require('./sales-order.routes'));
router.use('/purchase-orders', authMiddleware, require('./purchase-order.routes'));
router.use('/invoices', authMiddleware, require('./invoice.routes'));

module.exports = router;
