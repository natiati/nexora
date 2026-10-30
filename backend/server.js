// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prisma = require('./src/lib/prisma');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error-handler');
const { LoginSchema } = require('./src/dtos/auth.dto');

// Rutas (todas en src/api, arquitectura MVC)
const productRoutes = require('./src/api/product.routes');
const supplierRoutes = require('./src/api/supplier.routes');
const customerRoutes = require('./src/api/customer.routes');
const stockRoutes = require('./src/api/stock.routes');
const salesOrderRoutes = require('./src/api/sales-order.routes');
const purchaseOrderRoutes = require('./src/api/purchase-order.routes');
const invoiceRoutes = require('./src/api/invoice.routes');

const app = express();

app.use(cors({ exposedHeaders: ['X-Total-Count'] }));
app.use(express.json());

// Rutas protegidas con JWT
app.use('/products', authMiddleware, productRoutes);
app.use('/suppliers', authMiddleware, supplierRoutes);
app.use('/customers', authMiddleware, customerRoutes);
app.use('/stock', authMiddleware, stockRoutes);
app.use('/sales-orders', authMiddleware, salesOrderRoutes);
app.use('/purchase-orders', authMiddleware, purchaseOrderRoutes);
app.use('/invoices', authMiddleware, invoiceRoutes);

// Ruta de prueba para confirmar que el servidor y Prisma funcionan
app.get('/', (req, res) => {
  res.json({ message: 'API de Nexora funcionando' });
});

// Login
app.post('/login', async (req, res) => {
  try {
    // Valida que lleguen un correo con formato válido y una contraseña
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Debe ir después de todas las rutas
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 