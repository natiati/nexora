const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class ProductModel extends BaseModel { static prismaModel = prisma.product; }
module.exports = ProductModel;