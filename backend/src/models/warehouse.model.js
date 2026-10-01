const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class WarehouseModel extends BaseModel { static prismaModel = prisma.warehouse; }
module.exports = WarehouseModel;