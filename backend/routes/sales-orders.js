
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Crear orden de venta (estado inicial: "quote")
router.post('/', async (req, res) => {
  try {
    const {
      companyId,
      customerId,
      warehouseId,
      orderNumber,
      orderDate,
      items,
      userId,
    } = req.body;

    // items: [{ productId, quantity, unitPrice }]

    let subtotal = 0;

    const itemsData = items.map((it) => {
      const total = it.quantity * it.unitPrice;
      subtotal += total;

      return {
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        subtotal: total,
        total,
      };
    });

    const order = await prisma.salesOrder.create({
      data: {
        companyId,
        customerId,
        warehouseId,
        orderNumber,
        orderDate: new Date(orderDate),
        status: 'quote',
        subtotal,
        total: subtotal,
        createdBy: userId,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: 'No se pudo crear la orden de venta',
    });
  }
});

// Listar órdenes de venta
router.get('/', async (req, res) => {
  const orders = await prisma.salesOrder.findMany({
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json(orders);
});

// Confirmar orden (descuenta stock de cada producto)
router.post('/:id/confirm', async (req, res) => {
  try {
    const { userId } = req.body;
    const orderId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Orden no encontrada');
      }

      if (order.status !== 'quote') {
        throw new Error('La orden ya fue procesada');
      }

      for (const item of order.items) {
        const stock = await tx.stockLevel.findUnique({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: order.warehouseId,
            },
          },
        });

        if (
          !stock ||
          Number(stock.quantity) < Number(item.quantity)
        ) {
          throw new Error(
            `Stock insuficiente para el producto ${item.productId}`
          );
        }

        await tx.stockLevel.update({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: order.warehouseId,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            companyId: order.companyId,
            productId: item.productId,
            warehouseId: order.warehouseId,
            type: 'sale_out',
            quantity: -item.quantity,
            referenceType: 'sales_order',
            referenceId: order.id,
            createdBy: userId,
          },
        });
      }

      return tx.salesOrder.update({
        where: { id: orderId },
        data: {
          status: 'confirmed',
        },
        include: {
          items: true,
        },
      });
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: error.message || 'No se pudo confirmar la orden',
    });
  }
});

module.exports = router;