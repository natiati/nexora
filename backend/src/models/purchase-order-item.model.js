const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `purchase_order_items`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class PurchaseOrderItemModel extends BaseModel {
  static prismaModel = prisma.purchaseOrderItem;

  static tableName = 'purchase_order_items';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'purchase_order_id', property: 'purchaseOrderId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'product_id', property: 'productId', type: 'TEXT', required: true },
    { column: 'quantity', property: 'quantity', type: 'NUMERIC(14,3)', required: true },
    { column: 'received_quantity', property: 'receivedQuantity', type: 'NUMERIC(14,3)', required: true, default: '0' },
    { column: 'unit_cost', property: 'unitCost', type: 'NUMERIC(14,2)', required: true },
    { column: 'tax_rate', property: 'taxRate', type: 'NUMERIC(5,2)', required: true, default: '0' },
    { column: 'subtotal', property: 'subtotal', type: 'NUMERIC(14,2)', required: true },
    { column: 'total', property: 'total', type: 'NUMERIC(14,2)', required: true }
  ];

  // Relaciones con otras tablas
  static relations = {
    purchaseOrder: { model: 'PurchaseOrder', foreignKey: 'purchase_order_id', type: 'belongsTo', required: true }
  };

  // Ítems de una orden de compra
  static async findByOrder(purchaseOrderId) {
    return prisma.purchaseOrderItem.findMany({ where: { purchaseOrderId } });
  }
}

module.exports = PurchaseOrderItemModel;