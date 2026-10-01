const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class PurchaseOrderItemModel extends BaseModel {
  static prismaModel = prisma.purchaseOrderItem;
  static async findByOrder(purchaseOrderId) {
    return prisma.purchaseOrderItem.findMany({ where: { purchaseOrderId } });
  }
}
module.exports = PurchaseOrderItemModel;