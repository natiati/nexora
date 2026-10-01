const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class StockMovementModel extends BaseModel {
  static prismaModel = prisma.stockMovement;

  static async findByProduct(productId) {
    return prisma.stockMovement.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } });
  }
}
module.exports = StockMovementModel;