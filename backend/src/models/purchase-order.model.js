const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `purchase_orders`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class PurchaseOrderModel extends BaseModel {
  static prismaModel = prisma.purchaseOrder;

  static tableName = 'purchase_orders';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'supplier_id', property: 'supplierId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'order_number', property: 'orderNumber', type: 'VARCHAR(30)', required: true },
    { column: 'status', property: 'status', type: 'VARCHAR(30)', required: true, default: 'draft' },
    { column: 'order_date', property: 'orderDate', type: 'DATE', required: true },
    { column: 'expected_date', property: 'expectedDate', type: 'DATE', required: false },
    { column: 'subtotal', property: 'subtotal', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'tax_amount', property: 'taxAmount', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'total', property: 'total', type: 'NUMERIC(14,2)', required: true, default: '0' },
    { column: 'notes', property: 'notes', type: 'TEXT', required: false },
    { column: 'created_by', property: 'createdBy', type: 'TEXT', required: true },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true }
  ];

  // Relaciones con otras tablas
  static relations = {
    supplier: { model: 'Supplier', foreignKey: 'supplier_id', type: 'belongsTo', required: true },
    items: { model: 'PurchaseOrderItem', type: 'hasMany' }
  };

  // Orden con sus ítems y su proveedor
  static async findWithItems(id) {
    return prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true, supplier: true } });
  }

  static async findBySupplier(supplierId) {
    return prisma.purchaseOrder.findMany({ where: { supplierId }, orderBy: { orderDate: 'desc' } });
  }
}

module.exports = PurchaseOrderModel;