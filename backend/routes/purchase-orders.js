// backend/routes/purchase-orders.js
//las rutas de órdenes de compra

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Crear orden de compra
router.post('/', async (req, res) => {
  try {
    const { companyId, supplierId, warehouseId, orderNumber, orderDate, items, userId } = req.body;
    // items: [{ productId, quantity, unitCost }]

    let subtotal = 0;
    const itemsData = items.map((it) => {
      const total = it.quantity * it.unitCost;
      subtotal += total;
      return {
        productId: it.productId,
        quantity: it.quantity,
        unitCost: it.unitCost,
        subtotal: total,
        total,
      };
    });

    const order = await prisma.purchaseOrder.create({
      data: {
        companyId, supplierId, warehouseId, orderNumber,
        orderDate: new Date(orderDate),
        status: 'ordered',
        subtotal,
        total: subtotal,
        createdBy: userId,
        items: { create: itemsData },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo crear la orden de compra' });
  }
});

// Listar órdenes de compra
router.get('/', async (req, res) => {
  const orders = await prisma.purchaseOrder.findMany({
    include: { supplier: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

// Recibir orden (suma stock)
router.post('/:id/receive', async (req, res) => {
  try {
    const { userId } = req.body;
    const orderId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error('Orden no encontrada');
      if (order.status === 'received') throw new Error('La orden ya fue recibida');

      for (const item of order.items) {
        const existing = await tx.stockLevel.findUnique({
          where: { productId_warehouseId: { productId: item.productId, warehouseId: order.warehouseId } },
        });

        if (existing) {
          await tx.stockLevel.update({
            where: { productId_warehouseId: { productId: item.productId, warehouseId: order.warehouseId } },
            data: { quantity: { increment: item.quantity } },
          });
        } else {
          await tx.stockLevel.create({
            data: {
              companyId: order.companyId,
              productId: item.productId,
              warehouseId: order.warehouseId,
              quantity: item.quantity,
            },
          });
        }

        await tx.stockMovement.create({
          data: {
            companyId: order.companyId,
            productId: item.productId,
            warehouseId: order.warehouseId,
            type: 'purchase_in',
            quantity: item.quantity,
            unitCost: item.unitCost,
            referenceType: 'purchase_order',
            referenceId: order.id,
            createdBy: userId,
          },
        });

        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: { receivedQuantity: item.quantity },
        });
      }

      return tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: 'received' },
        include: { items: true },
      });
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'No se pudo recibir la orden' });
  }
});

module.exports = router;