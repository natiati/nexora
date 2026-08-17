const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Consultar stock
router.get('/', async (req, res) => {
  try {
    const stock = await prisma.stockLevel.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    res.json(stock);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'No se pudo obtener el stock',
    });
  }
});

// Ajustar stock manualmente
router.post('/adjust', async (req, res) => {
  try {
    const {
      companyId,
      productId,
      warehouseId,
      quantity,
      notes,
      userId,
    } = req.body;

    // quantity positivo = entrada
    // quantity negativo = salida

    const result = await prisma.$transaction(async (tx) => {     //aqui estamos usando una transaccion para asegurarnos de que todas las operaciones se realicen correctamente o ninguna se realice en caso de error
      const existing = await tx.stockLevel.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
      });

      const stockLevel = existing
        ? await tx.stockLevel.update({
            where: {
              productId_warehouseId: {
                productId,
                warehouseId,
              },
            },
            data: {
              quantity: {
                increment: quantity,
              },
            },
          })
        : await tx.stockLevel.create({
            data: {
              companyId,
              productId,
              warehouseId,
              quantity,
            },
          });

      await tx.stockMovement.create({
        data: {
          companyId,
          productId,
          warehouseId,
          type: 'adjustment',
          quantity,
          notes,
          createdBy: userId,
        },
      });

      return stockLevel;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: 'No se pudo ajustar el stock',
    });
  }
});

module.exports = router;