const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class SupplierModel extends BaseModel { static prismaModel = prisma.supplier; }
module.exports = SupplierModel;