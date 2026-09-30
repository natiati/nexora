const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class RoleModel extends BaseModel { static prismaModel = prisma.role; }
module.exports = RoleModel;