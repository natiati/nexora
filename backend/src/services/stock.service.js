const prisma = require('../lib/prisma');
const AppError = require('../utils/app-error');
const ProductModel = require('../models/product.model');
const WarehouseModel = require('../models/warehouse.model');
const StockLevelModel = require('../models/stock-level.model');

class StockService {
  // GET /stock: saldos con su almacén y su producto
  static async list() {
    const levels = await StockLevelModel.findAll({}, { include: { warehouse: true } });
    const products = await ProductModel.findMapByIds([...new Set(levels.map((l) => l.productId))]);
    return levels.map((level) => ({ ...level, product: products.get(level.productId) ?? null }));
  }

  // POST /stock/adjust: positivo = entrada, negativo = salida
  static async adjust({ productId, warehouseId, quantity, notes, userId }) {
    const [product, warehouse] = await Promise.all([
      ProductModel.findById(productId),
      WarehouseModel.findById(warehouseId)
    ]);
    if (!product) throw new AppError('Producto no encontrado', 400);
    if (!warehouse) throw new AppError('Almacén no encontrado', 400);

    return prisma.$transaction(async (tx) => {
      if (quantity > 0) {
        await StockService.increase(tx, { productId, warehouseId, quantity });
      } else {
        await StockService.decrease(tx, { productId, warehouseId, quantity: -quantity });
      }

      await tx.stockMovement.create({
        data: { productId, warehouseId, type: 'adjustment', quantity, notes, createdBy: userId }
      });

      return tx.stockLevel.findFirst({ where: { productId, warehouseId } });
    });
  }

  // Suma stock dentro de una transacción (crea el saldo si no existe)
  static async increase(tx, { productId, warehouseId, quantity }) {
    const level = await tx.stockLevel.findFirst({ where: { productId, warehouseId } });
    if (level) {
      return tx.stockLevel.update({
        where: { id: level.id },
        data: { quantity: { increment: quantity } }
      });
    }
    return tx.stockLevel.create({ data: { productId, warehouseId, quantity } });
  }

  // Descuenta stock dentro de una transacción. El UPDATE lleva la condición
  // "quantity >= cantidad", así dos ventas simultáneas no dejan el saldo negativo.
  static async decrease(tx, { productId, warehouseId, quantity }) {
    const level = await tx.stockLevel.findFirst({ where: { productId, warehouseId } });
    const result = level
      ? await tx.stockLevel.updateMany({
          where: { id: level.id, quantity: { gte: quantity } },
          data: { quantity: { decrement: quantity } }
        })
      : null;

    if (!result || result.count === 0) {
      throw new AppError(`Stock insuficiente para el producto ${productId}`, 409);
    }
  }
}

module.exports = StockService;