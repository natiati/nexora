const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class CustomerInteractionModel extends BaseModel { static prismaModel = prisma.customerInteraction; }
module.exports = CustomerInteractionModel;