const { Prisma } = require('@prisma/client');

const AppError = require('../utils/app-error');
const { generateDocumentNumber } = require('../utils/document-number');
const InvoiceModel = require('../models/invoice.model');
const PaymentModel = require('../models/payment.model');
const SalesOrderModel = require('../models/sales-order.model');

// "30 días" → 30. Las condiciones de pago del cliente definen el vencimiento por defecto.
function dueDateFromTerms(paymentTerms) {
  const days = Number.parseInt(paymentTerms ?? '', 10);
  if (!Number.isInteger(days) || days <= 0) return null;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// Ciclo de vida: issued → partial → paid · issued → cancelled (solo sin pagos)
class InvoiceService {
  // invoices no tiene company_id: la empresa se alcanza por la orden de venta y su cliente
  static scope(companyId) {
    return { salesOrder: { customer: { companyId } } };
  }

  // POST /invoices: factura desde una orden de venta
  static async create(companyId, { salesOrderId, invoiceNumber, dueDate, notes, userId }) {
    const order = await SalesOrderModel.findOne(
      { id: salesOrderId, customer: { companyId } },
      { include: { customer: true } }
    );

    if (!order) {
      throw new AppError('Orden de venta no encontrada', 404);
    }

    // Solo se factura una orden confirmada o entregada (no una cotización)
    if (order.status !== 'confirmed' && order.status !== 'delivered') {
      throw new AppError('Solo se pueden facturar órdenes de venta confirmadas', 409);
    }

    // Una orden de venta solo puede tener una factura activa
    const existing = await InvoiceModel.count({ salesOrderId, status: { not: 'cancelled' } });
    if (existing > 0) {
      throw new AppError('La orden de venta ya tiene una factura', 409);
    }

    const number = invoiceNumber || generateDocumentNumber('INV');
    if (await InvoiceModel.findOne({ invoiceNumber: number, ...this.scope(companyId) })) {
      throw new AppError('Ya existe una factura con ese número', 409);
    }

    return InvoiceModel.create({
      salesOrderId,
      invoiceNumber: number,
      status: 'issued',
      issueDate: new Date(),
      dueDate: dueDate ?? dueDateFromTerms(order.customer.paymentTerms),
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      total: order.total,
      paidAmount: 0,
      notes,
      createdBy: userId
    });
  }

  // GET /invoices/:id
  static async getById(companyId, invoiceId) {
    const invoice = await InvoiceModel.findOne(
      { id: invoiceId, ...this.scope(companyId) },
      { include: { payments: { orderBy: { createdAt: 'desc' } }, salesOrder: { include: { customer: true } } } }
    );
    if (!invoice) throw new AppError('Factura no encontrada', 404);
    return { ...invoice, customer: invoice.salesOrder?.customer ?? null };
  }

  // GET /invoices: facturas paginadas
  static async list(companyId, { skip, take }) {
    const where = this.scope(companyId);
    const [invoices, total] = await Promise.all([
      InvoiceModel.findAll(where, {
        include: {
          payments: { orderBy: { createdAt: 'desc' } },
          salesOrder: { include: { customer: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      InvoiceModel.count(where)
    ]);

    // Mantiene "customer" al nivel superior (Invoice no tiene relación directa con Customer)
    const data = invoices.map((invoice) => ({
      ...invoice,
      customer: invoice.salesOrder?.customer ?? null
    }));

    return { data, total };
  }

  // POST /invoices/:id/payments
  static async registerPayment(companyId, invoiceId, { amount, paymentMethod, paymentDate, reference, notes, userId }) {
    return InvoiceModel.transaction(async (tx) => {
      await InvoiceModel.lock(tx, invoiceId);

      const invoice = await InvoiceModel.findOne({ id: invoiceId, ...this.scope(companyId) }, {}, tx);

      if (!invoice) {
        throw new AppError('Factura no encontrada', 404);
      }

      if (invoice.status === 'cancelled') {
        throw new AppError('La factura está anulada', 409);
      }

      const newPaidAmount = new Prisma.Decimal(invoice.paidAmount).plus(amount);

      if (newPaidAmount.gt(invoice.total)) {
        throw new AppError('El pago supera el saldo pendiente', 409);
      }

      await PaymentModel.create(
        {
          invoiceId,
          amount,
          paymentDate: paymentDate ?? new Date(),
          paymentMethod,
          reference,
          notes,
          createdBy: userId
        },
        {},
        tx
      );

      return InvoiceModel.update(
        invoiceId,
        {
          paidAmount: newPaidAmount,
          status: newPaidAmount.gte(invoice.total) ? 'paid' : 'partial'
        },
        { include: { payments: true } },
        tx
      );
    });
  }

  // POST /invoices/:id/cancel: solo si no tiene pagos
  static async cancel(companyId, invoiceId) {
    return InvoiceModel.transaction(async (tx) => {
      await InvoiceModel.lock(tx, invoiceId);

      const invoice = await InvoiceModel.findOne({ id: invoiceId, ...this.scope(companyId) }, {}, tx);

      if (!invoice) throw new AppError('Factura no encontrada', 404);
      if (invoice.status === 'cancelled') throw new AppError('La factura ya está anulada', 409);
      if (Number(invoice.paidAmount) > 0) throw new AppError('No se puede anular una factura con pagos', 409);

      return InvoiceModel.update(invoiceId, { status: 'cancelled' }, {}, tx);
    });
  }
}

module.exports = InvoiceService;
