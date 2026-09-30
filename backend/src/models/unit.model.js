const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class UnitModel extends BaseModel { static prismaModel = prisma.unit; }
module.exports = UnitModel;