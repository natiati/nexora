const AppError = require('../utils/app-error');
const ProductModel = require('../models/product.model');
const WarehouseModel = require('../models/warehouse.model');
const StockLevelModel = require('../models/stock-level.model');
const StockMovementModel = require('../models/stock-movement.model');
const ProductService = require('./product.service');

// stock_levels y stock_movements no tienen relación con products: se unen aquí
async function withProducts(rows) {
  const products = await ProductModel.findMapByIds([...new Set(rows.map((row) => row.productId))]);
  return rows.map((row) => ({ ...row, product: products.get(row.productId) ?? null }));
}

class StockService {
  // GET /stock: saldos con su almacén y su producto
  static async list(companyId, { skip, take }) {
    const where = { warehouse: { companyId } };
    const [levels, total] = await Promise.all([
      StockLevelModel.findAll(where, { include: { warehouse: true }, orderBy: { updatedAt: 'desc' }, skip, take }),
      StockLevelModel.count(where)
    ]);

    return { data: await withProducts(levels), total };
  }

  // GET /stock/movements: historial, del más reciente al más antiguo
  static async listMovements(companyId, { skip, take }) {
    const where = { warehouse: { companyId } };
    const [movements, total] = await Promise.all([
      StockMovementModel.findAll(where, { include: { warehouse: true }, orderBy: { createdAt: 'desc' }, skip, take }),
      StockMovementModel.count(where)
    ]);

    return { data: await withProducts(movements), total };
  }

  // POST /stock/adjust: positivo = entrada, negativo = salida
  static async adjust(companyId, { productId, warehouseId, quantity, notes, userId }) {
    await ProductService.getById(companyId, productId);

    const warehouse = await WarehouseModel.findOne({ id: warehouseId, companyId });
    if (!warehouse) throw new AppError('Almacén no encontrado', 404);

    return StockLevelModel.transaction(async (tx) => {
      if (quantity > 0) {
        await StockService.increase(tx, { productId, warehouseId, quantity });
      } else {
        await StockService.decrease(tx, { productId, warehouseId, quantity: -quantity });
      }

      await StockService.recordMovement(tx, { productId, warehouseId, type: 'adjustment', quantity, notes, userId });

      return StockLevelModel.findOne({ productId, warehouseId }, {}, tx);
    });
  }

  // Almacén donde entran y salen las órdenes de compra y venta
  static async getDefaultWarehouse(tx, companyId) {
    const warehouse = await WarehouseModel.findOne({ companyId, isDefault: true }, {}, tx);
    if (!warehouse) {
      throw new AppError('La empresa no tiene un almacén predeterminado configurado', 409);
    }
    return warehouse;
  }

  static async recordMovement(tx, { userId, ...movement }) {
    return StockMovementModel.create({ ...movement, createdBy: userId }, {}, tx);
  }

  // Suma stock dentro de una transacción (crea el saldo si no existe)
  static async increase(tx, { productId, warehouseId, quantity }) {
    await StockLevelModel.lock(tx, productId, warehouseId);
    const level = await StockLevelModel.findOne({ productId, warehouseId }, {}, tx);

    if (level) {
      await StockLevelModel.addQuantity(tx, level.id, quantity);
    } else {
      await StockLevelModel.create({ productId, warehouseId, quantity }, {}, tx);
    }
  }

  // Descuenta stock dentro de una transacción. El UPDATE lleva la condición de disponibilidad,
  // así dos operaciones simultáneas no dejan el saldo negativo ni tocan lo reservado.
  static async decrease(tx, { productId, warehouseId, quantity }) {
    await StockService.applyToLevel(tx, productId, warehouseId, (id) =>
      StockLevelModel.subtractAvailable(tx, id, quantity));
  }

  // Aparta stock para una orden confirmada
  static async reserve(tx, { productId, warehouseId, quantity }) {
    await StockService.applyToLevel(tx, productId, warehouseId, (id) =>
      StockLevelModel.reserve(tx, id, quantity));
  }

  // Libera lo apartado por una orden que se cancela
  static async release(tx, { productId, warehouseId, quantity }) {
    await StockService.applyToLevel(tx, productId, warehouseId, (id) =>
      StockLevelModel.release(tx, id, quantity));
  }

  // Convierte la reserva en salida real al entregar
  static async consumeReservation(tx, { productId, warehouseId, quantity }) {
    await StockService.applyToLevel(tx, productId, warehouseId, (id) =>
      StockLevelModel.consumeReservation(tx, id, quantity));
  }

  static async applyToLevel(tx, productId, warehouseId, operation) {
    const level = await StockLevelModel.findOne({ productId, warehouseId }, {}, tx);
    const affected = level ? await operation(level.id) : 0;

    if (affected === 0) {
      const product = await ProductModel.findById(productId, {}, tx);
      throw new AppError(`Stock insuficiente para ${product?.name ?? 'el producto'}`, 409);
    }
  }
}

module.exports = StockService;
