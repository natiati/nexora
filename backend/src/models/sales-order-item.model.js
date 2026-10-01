const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class SalesOrderItemModel extends BaseModel {
  static prismaModel = prisma.salesOrderItem;
  static async findByOrder(salesOrderId) {
    return prisma.salesOrderItem.findMany({ where: { salesOrderId } });
  }
}
module.exports = SalesOrderItemModel;
