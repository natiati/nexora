const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `user_company_roles`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class UserCompanyRoleModel extends BaseModel {
  static prismaModel = prisma.userCompanyRole;

  static tableName = 'user_company_roles';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'user_id', property: 'userId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'role_id', property: 'roleId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'is_default', property: 'isDefault', type: 'BOOLEAN', required: true, default: 'false' },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' }
  ];

  // Relaciones con otras tablas
  static relations = {
    user: { model: 'User', foreignKey: 'user_id', type: 'belongsTo', required: true },
    role: { model: 'Role', foreignKey: 'role_id', type: 'belongsTo', required: true }
  };

  // Roles asignados a un usuario
  static async findByUser(userId) {
    return prisma.userCompanyRole.findMany({ where: { userId }, include: { role: true } });
  }

  // Rol/empresa predeterminado del usuario
  static async findDefaultByUser(userId) {
    return prisma.userCompanyRole.findFirst({ where: { userId, isDefault: true }, include: { role: true } });
  }
}

module.exports = UserCompanyRoleModel;