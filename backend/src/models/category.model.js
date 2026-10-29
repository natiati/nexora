const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `categories`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class CategoryModel extends BaseModel {
  static prismaModel = prisma.category;

  static tableName = 'categories';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'company_id', property: 'companyId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'name', property: 'name', type: 'VARCHAR(120)', required: true },
    { column: 'slug', property: 'slug', type: 'VARCHAR(120)', required: true },
    { column: 'description', property: 'description', type: 'TEXT', required: false },
    { column: 'is_active', property: 'isActive', type: 'BOOLEAN', required: true, default: 'true' },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true },
    { column: 'deleted_at', property: 'deletedAt', type: 'TIMESTAMP(3)', required: false }
  ];

  // Relaciones con otras tablas
  static relations = {
    company: { model: 'Company', foreignKey: 'company_id', type: 'belongsTo', required: true },
    products: { model: 'Product', type: 'hasMany' }
  };

  // Categorías de una empresa, sin las eliminadas
  static async findByCompany(companyId) {
    return prisma.category.findMany({ where: { companyId, deletedAt: null }, orderBy: { name: 'asc' } });
  }

  static async findBySlug(companyId, slug) {
    return prisma.category.findFirst({ where: { companyId, slug, deletedAt: null } });
  }
}

module.exports = CategoryModel;