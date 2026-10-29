const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `roles`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class RoleModel extends BaseModel {
  static prismaModel = prisma.role;

  static tableName = 'roles';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'company_id', property: 'companyId', type: 'TEXT', required: false, key: 'FK' },
    { column: 'name', property: 'name', type: 'VARCHAR(80)', required: true },
    { column: 'slug', property: 'slug', type: 'VARCHAR(80)', required: true },
    { column: 'description', property: 'description', type: 'TEXT', required: false },
    { column: 'is_system', property: 'isSystem', type: 'BOOLEAN', required: true, default: 'false' },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true }
  ];

  // Relaciones con otras tablas
  static relations = {
    company: { model: 'Company', foreignKey: 'company_id', type: 'belongsTo', required: false },
    userCompanyRoles: { model: 'UserCompanyRole', type: 'hasMany' }
  };

  // Roles de una empresa más los roles de sistema (company_id nulo)
  static async findByCompany(companyId) {
    return prisma.role.findMany({ where: { OR: [{ companyId }, { companyId: null }] }, orderBy: { name: 'asc' } });
  }

  static async findBySlug(slug, companyId = null) {
    return prisma.role.findFirst({ where: { slug, companyId } });
  }
}

module.exports = RoleModel;