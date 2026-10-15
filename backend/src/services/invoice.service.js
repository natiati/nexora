const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const AppError = require('../utils/app-error');
const InvoiceModel = require('../models/invoice.model');
const SalesOrderModel = require('../models/sales-order.model');

class InvoiceService {
  // POST /invoices: factura desde una orden de venta
  static async create({ salesOrderId, invoiceNumber, userId }) {
    const order = await SalesOrderModel.findById(salesOrderId);
    if (!order) throw new AppError('Orden de venta no encontrada', 404);

    return InvoiceModel.create({
      salesOrderId,
      invoiceNumber,
      status: 'issued',
      issueDate: new Date(),
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      total: order.total,
      paidAmount: 0,
      createdBy: userId
    });
  }

  // GET /invoices
  static async list() {
    const invoices = await InvoiceModel.findAll(
      {},
      {
        include: { payments: true, salesOrder: { include: { customer: true } } },
        orderBy: { createdAt: 'desc' }
      }
    );
    // Mantiene "customer" al nivel superior (Invoice no tiene relación directa con Customer)
    return invoices.map((invoice) => ({ ...invoice, customer: invoice.salesOrder?.customer ?? null }));
  }

  // POST /invoices/:id/payments
  static async registerPayment(invoiceId, { amount, paymentMethod, userId }) {
    return prisma.$transaction(async (tx) => {
      // Bloquea la factura hasta terminar: dos pagos simultáneos no pueden pasarse del total
      await tx.$queryRaw`SELECT id FROM invoices WHERE id = ${invoiceId} FOR UPDATE`;

      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new AppError('Factura no encontrada', 404);

      const newPaidAmount = new Prisma.Decimal(invoice.paidAmount).plus(amount);
      if (newPaidAmount.gt(invoice.total)) {
        throw new AppError('El pago supera el saldo pendiente', 409);
      }

      await tx.payment.create({
        data: { invoiceId, amount, paymentDate: new Date(), paymentMethod, createdBy: userId }
      });

      return tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newPaidAmount.gte(invoice.total) ? 'paid' : 'partial'
        },
        include: { payments: true }
      });
    });
  }
}

module.exports = InvoiceService;