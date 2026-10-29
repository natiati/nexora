const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `stock_movements`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class StockMovementModel extends BaseModel {
  static prismaModel = prisma.stockMovement;

  static tableName = 'stock_movements';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'product_id', property: 'productId', type: 'TEXT', required: true },
    { column: 'warehouse_id', property: 'warehouseId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'type', property: 'type', type: 'VARCHAR(30)', required: true },
    { column: 'quantity', property: 'quantity', type: 'NUMERIC(14,3)', required: true },
    { column: 'unit_cost', property: 'unitCost', type: 'NUMERIC(14,2)', required: false },
    { column: 'reference_type', property: 'referenceType', type: 'VARCHAR(40)', required: false },
    { column: 'reference_id', property: 'referenceId', type: 'TEXT', required: false },
    { column: 'notes', property: 'notes', type: 'TEXT', required: false },
    { column: 'created_by', property: 'createdBy', type: 'TEXT', required: true },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' }
  ];

  // Relaciones con otras tablas
  static relations = {
    warehouse: { model: 'Warehouse', foreignKey: 'warehouse_id', type: 'belongsTo', required: true }
  };

  // Historial de movimientos de un producto
  static async findByProduct(productId) {
    return prisma.stockMovement.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } });
  }

  static async findByWarehouse(warehouseId) {
    return prisma.stockMovement.findMany({ where: { warehouseId }, orderBy: { createdAt: 'desc' } });
  }

  // Movimientos generados por un documento (orden de compra, de venta, etc.)
  static async findByReference(referenceType, referenceId) {
    return prisma.stockMovement.findMany({ where: { referenceType, referenceId } });
  }
}

module.exports = StockMovementModel;