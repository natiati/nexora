// backend/routes/suppliers.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

router.get('/', async (req, res) => {
  const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(suppliers);
});

router.post('/', async (req, res) => {
  try {
    const { companyId, name, email, phone, contactName } = req.body;
    const supplier = await prisma.supplier.create({
      data: { companyId, name, email, phone, contactName },
    });
    res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo crear el proveedor' });
  }
});

module.exports = router;