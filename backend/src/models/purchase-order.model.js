const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class PurchaseOrderModel extends BaseModel { static prismaModel = prisma.purchaseOrder; }
module.exports = PurchaseOrderModel;