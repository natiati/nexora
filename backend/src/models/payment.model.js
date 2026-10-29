const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `payments`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class PaymentModel extends BaseModel {
  static prismaModel = prisma.payment;

  static tableName = 'payments';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'invoice_id', property: 'invoiceId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'amount', property: 'amount', type: 'NUMERIC(14,2)', required: true },
    { column: 'payment_date', property: 'paymentDate', type: 'DATE', required: true },
    { column: 'payment_method', property: 'paymentMethod', type: 'VARCHAR(40)', required: true },
    { column: 'reference', property: 'reference', type: 'VARCHAR(100)', required: false },
    { column: 'notes', property: 'notes', type: 'TEXT', required: false },
    { column: 'created_by', property: 'createdBy', type: 'TEXT', required: true },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' }
  ];

  // Relaciones con otras tablas
  static relations = {
    invoice: { model: 'Invoice', foreignKey: 'invoice_id', type: 'belongsTo', required: true }
  };

  // Pagos de una factura
  static async findByInvoice(invoiceId) {
    return prisma.payment.findMany({ where: { invoiceId }, orderBy: { paymentDate: 'asc' } });
  }
}

module.exports = PaymentModel;