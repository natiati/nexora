const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `stock_levels`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class StockLevelModel extends BaseModel {
  static delegate = 'stockLevel';

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

  // Serializa las operaciones sobre un mismo producto/almacén hasta terminar la transacción.
  // El schema no tiene índice único (producto, almacén): así no se crean dos saldos a la vez.
  static async lock(tx, productId, warehouseId) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${productId + ':' + warehouseId}, 0))`;
  }

  // Entrada de mercancía
  static async addQuantity(tx, id, quantity) {
    return tx.$executeRaw`
      UPDATE stock_levels SET quantity = quantity + ${String(quantity)}::numeric, updated_at = now()
      WHERE id = ${id}`;
  }

  // Salida directa: solo si alcanza lo disponible (cantidad - reservado). Devuelve filas afectadas.
  static async subtractAvailable(tx, id, quantity) {
    return tx.$executeRaw`
      UPDATE stock_levels SET quantity = quantity - ${String(quantity)}::numeric, updated_at = now()
      WHERE id = ${id} AND quantity - reserved_quantity >= ${String(quantity)}::numeric`;
  }

  // Aparta stock para una orden confirmada: solo si alcanza lo disponible
  static async reserve(tx, id, quantity) {
    return tx.$executeRaw`
      UPDATE stock_levels SET reserved_quantity = reserved_quantity + ${String(quantity)}::numeric, updated_at = now()
      WHERE id = ${id} AND quantity - reserved_quantity >= ${String(quantity)}::numeric`;
  }

  // Libera una reserva (orden cancelada)
  static async release(tx, id, quantity) {
    return tx.$executeRaw`
      UPDATE stock_levels SET reserved_quantity = reserved_quantity - ${String(quantity)}::numeric, updated_at = now()
      WHERE id = ${id} AND reserved_quantity >= ${String(quantity)}::numeric`;
  }

  // Convierte una reserva en salida real (orden entregada)
  static async consumeReservation(tx, id, quantity) {
    return tx.$executeRaw`
      UPDATE stock_levels
      SET quantity = quantity - ${String(quantity)}::numeric,
          reserved_quantity = reserved_quantity - ${String(quantity)}::numeric,
          updated_at = now()
      WHERE id = ${id} AND reserved_quantity >= ${String(quantity)}::numeric AND quantity >= ${String(quantity)}::numeric`;
  }

  // Existencias por producto en todos los almacenes de una empresa
  static async sumByProduct(companyId) {
    const rows = await prisma.stockLevel.groupBy({
      by: ['productId'],
      where: { warehouse: { companyId } },
      _sum: { quantity: true }
    });
    return new Map(rows.map((row) => [row.productId, Number(row._sum.quantity ?? 0)]));
  }
}

module.exports = StockLevelModel;