// backend/routes/invoices.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Crear factura desde una orden de venta
router.post('/', async (req, res) => {
  try {
    const { companyId, customerId, salesOrderId, invoiceNumber, userId } = req.body;

    const order = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: 'Orden de venta no encontrada' });

    const itemsData = order.items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
      total: it.total,
    }));

    const invoice = await prisma.invoice.create({
      data: {
        companyId, customerId, salesOrderId,
        invoiceNumber,
        status: 'issued',
        issueDate: new Date(),
        subtotal: order.subtotal,
        total: order.total,
        paidAmount: 0,
        createdBy: userId,
        items: { create: itemsData },
      },
      include: { items: true },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo crear la factura' });
  }
});

// Listar facturas
router.get('/', async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    include: { customer: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(invoices);
});

// Registrar pago
router.post('/:id/payments', async (req, res) => {
  try {
    const { companyId, amount, paymentMethod, userId } = req.body;
    const invoiceId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new Error('Factura no encontrada');

      const newPaidAmount = Number(invoice.paidAmount) + Number(amount);
      if (newPaidAmount > Number(invoice.total)) {
        throw new Error('El pago supera el saldo pendiente');
      }

      await tx.payment.create({
        data: {
          companyId, invoiceId, amount,
          paymentDate: new Date(),
          paymentMethod,
          createdBy: userId,
        },
      });

      return tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newPaidAmount >= Number(invoice.total) ? 'paid' : 'partial',
        },
        include: { payments: true },
      });
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'No se pudo registrar el pago' });
  }
});

module.exports = router;