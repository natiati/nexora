const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `sales_order_items`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class SalesOrderItemModel extends BaseModel {
  static prismaModel = prisma.salesOrderItem;

  static tableName = 'sales_order_items';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'sales_order_id', property: 'salesOrderId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'product_id', property: 'productId', type: 'TEXT', required: true },
    { column: 'quantity', property: 'quantity', type: 'NUMERIC(14,3)', required: true },
    { column: 'delivered_quantity', property: 'deliveredQuantity', type: 'NUMERIC(14,3)', required: true, default: '0' },
    { column: 'unit_price', property: 'unitPrice', type: 'NUMERIC(14,2)', required: true },
    { column: 'tax_rate', property: 'taxRate', type: 'NUMERIC(5,2)', required: true, default: '0' },
    { column: 'discount_rate', property: 'discountRate', type: 'NUMERIC(5,2)', required: true, default: '0' },
    { column: 'subtotal', property: 'subtotal', type: 'NUMERIC(14,2)', required: true },
    { column: 'total', property: 'total', type: 'NUMERIC(14,2)', required: true }
  ];

  // Relaciones con otras tablas
  static relations = {
    salesOrder: { model: 'SalesOrder', foreignKey: 'sales_order_id', type: 'belongsTo', required: true }
  };

  // Ítems de una orden de venta
  static async findByOrder(salesOrderId) {
    return prisma.salesOrderItem.findMany({ where: { salesOrderId } });
  }
}

module.exports = SalesOrderItemModel;