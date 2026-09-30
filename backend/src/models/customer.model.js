const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class CustomerModel extends BaseModel { static prismaModel = prisma.customer; }
module.exports = CustomerModel;