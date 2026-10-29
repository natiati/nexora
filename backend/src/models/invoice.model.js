const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `invoices`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class InvoiceModel extends BaseModel {
  static prismaModel = prisma.invoice;

  static tableName = 'invoices';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'sales_order_id', property: 'salesOrderId', type: 'TEXT', required: false, key: 'FK' },
    { column: 'invoice_number', property: 'invoiceNumber', type: 'VARCHAR(30)', required: true },
    { column: 'status', property: 'status', type: 'VARCHAR(30)', required: true, default: 'draft' },
    { column: 'issue_date', property: 'issueDate', type: 'DATE', required: true },
    { column: 'due_date', property: 'dueDate', type: 'DATE', required: false },
    { column: 'subtotal', property: 'subtotal', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'tax_amount', property: 'taxAmount', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'discount_amount', property: 'discountAmount', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'total', property: 'total', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'paid_amount', property: 'paidAmount', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'notes', property: 'notes', type: 'TEXT', required: false },
    { column: 'created_by', property: 'createdBy', type: 'TEXT', required: true },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true }
  ];

  // Relaciones con otras tablas
  static relations = {
    salesOrder: { model: 'SalesOrder', foreignKey: 'sales_order_id', type: 'belongsTo', required: false },
    payments: { model: 'Payment', type: 'hasMany' }
  };

  // Factura con sus pagos
  static async findWithPayments(id) {
    return prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  }

  static async findBySalesOrder(salesOrderId) {
    return prisma.invoice.findMany({ where: { salesOrderId } });
  }
}

module.exports = InvoiceModel;