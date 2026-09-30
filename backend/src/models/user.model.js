const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class UserModel extends BaseModel { static prismaModel = prisma.user; }
module.exports = UserModel;