const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class CompanyModel extends BaseModel { static prismaModel = prisma.company; }
module.exports = CompanyModel;