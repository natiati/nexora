const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class SalesOrderModel extends BaseModel { static prismaModel = prisma.salesOrder; }
module.exports = SalesOrderModel;