const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `sales_orders`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class SalesOrderModel extends BaseModel {
  static prismaModel = prisma.salesOrder;

  static tableName = 'sales_orders';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'customer_id', property: 'customerId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'order_number', property: 'orderNumber', type: 'VARCHAR(30)', required: true },
    { column: 'status', property: 'status', type: 'VARCHAR(30)', required: true, default: 'quote' },
    { column: 'order_date', property: 'orderDate', type: 'DATE', required: true },
    { column: 'valid_until', property: 'validUntil', type: 'DATE', required: false },
    { column: 'subtotal', property: 'subtotal', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'tax_amount', property: 'taxAmount', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'discount_amount', property: 'discountAmount', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'total', property: 'total', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'notes', property: 'notes', type: 'TEXT', required: false },
    { column: 'created_by', property: 'createdBy', type: 'TEXT', required: true },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true }
  ];

  // Relaciones con otras tablas
  static relations = {
    customer: { model: 'Customer', foreignKey: 'customer_id', type: 'belongsTo', required: true },
    items: { model: 'SalesOrderItem', type: 'hasMany' },
    invoices: { model: 'Invoice', type: 'hasMany' }
  };

  // Orden con sus ítems, su cliente y sus facturas
  static async findWithItems(id) {
    return prisma.salesOrder.findUnique({ where: { id }, include: { items: true, customer: true, invoices: true } });
  }

  static async findByCustomer(customerId) {
    return prisma.salesOrder.findMany({ where: { customerId }, orderBy: { orderDate: 'desc' } });
  }
}

module.exports = SalesOrderModel;