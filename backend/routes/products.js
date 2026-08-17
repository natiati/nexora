const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Listar productos
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        unit: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'No se pudieron obtener los productos',
    });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  try {
    const {
      companyId,
      categoryId,
      unitId,
      sku,
      name,
      costPrice,
      salePrice,
      minStock,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        companyId,
        categoryId,
        unitId,
        sku,
        name,
        costPrice,
        salePrice,
        minStock: minStock ?? 0,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: 'No se pudo crear el producto',
    });
  }
});

// Editar producto
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      costPrice,
      salePrice,
      categoryId,
      unitId,
      minStock,
    } = req.body;

    const product = await prisma.product.update({
      where: {
        id: req.params.id,
      },
      data: {
        name,
        costPrice,
        salePrice,
        categoryId,
        unitId,
        minStock,
      },
    });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: 'No se pudo actualizar el producto',
    });
  }
});

module.exports = router;