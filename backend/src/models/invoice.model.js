const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class InvoiceModel extends BaseModel { static prismaModel = prisma.invoice; }
module.exports = InvoiceModel;
