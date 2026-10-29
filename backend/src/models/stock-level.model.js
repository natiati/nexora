const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `stock_levels`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class StockLevelModel extends BaseModel {
  static prismaModel = prisma.stockLevel;

  static tableName = 'stock_levels';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'product_id', property: 'productId', type: 'TEXT', required: true },
    { column: 'warehouse_id', property: 'warehouseId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'quantity', property: 'quantity', type: 'NUMERIC(14,3)', required: true, default: '0' },
    { column: 'reserved_quantity', property: 'reservedQuantity', type: 'NUMERIC(14,3)', required: true, default: '0' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true }
  ];

  // Relaciones con otras tablas
  static relations = {
    warehouse: { model: 'Warehouse', foreignKey: 'warehouse_id', type: 'belongsTo', required: true }
  };

  // Saldo de un producto en un almacén
  static async findByProductAndWarehouse(productId, warehouseId) {
    return prisma.stockLevel.findFirst({ where: { productId, warehouseId } });
  }

  static async findByWarehouse(warehouseId) {
    return prisma.stockLevel.findMany({ where: { warehouseId } });
  }
}

module.exports = StockLevelModel;