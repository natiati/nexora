const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Listar clientes
router.get('/', async (req, res) => {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(customers);
});

// Crear cliente
router.post('/', async (req, res) => {
  try {
    const { companyId, name, email, phone, address, city } = req.body;

    const customer = await prisma.customer.create({
      data: { companyId, name, email, phone, address, city },
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo crear el cliente' });
  }
});

module.exports = router;
