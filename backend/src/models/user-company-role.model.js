const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class UserCompanyRoleModel extends BaseModel { static prismaModel = prisma.userCompanyRole; }
module.exports = UserCompanyRoleModel;