const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class StockLevelModel extends BaseModel {
  static prismaModel = prisma.stockLevel;

  // Método propio: el saldo se consulta siempre por producto + almacén
  static async findByProductAndWarehouse(productId, warehouseId) {
    return prisma.stockLevel.findFirst({ where: { productId, warehouseId } });
  }
}
module.exports = StockLevelModel;