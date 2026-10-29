const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `companies`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class CompanyModel extends BaseModel {
  static prismaModel = prisma.company;

  static tableName = 'companies';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'name', property: 'name', type: 'VARCHAR(150)', required: true },
    { column: 'legal_name', property: 'legalName', type: 'VARCHAR(200)', required: false },
    { column: 'tax_id', property: 'taxId', type: 'VARCHAR(30)', required: false },
    { column: 'email', property: 'email', type: 'VARCHAR(150)', required: false },
    { column: 'phone', property: 'phone', type: 'VARCHAR(30)', required: false },
    { column: 'address', property: 'address', type: 'TEXT', required: false },
    { column: 'city', property: 'city', type: 'VARCHAR(100)', required: false },
    { column: 'country', property: 'country', type: 'VARCHAR(80)', required: false },
    { column: 'currency', property: 'currency', type: 'VARCHAR(3)', required: true, default: 'COP' },
    { column: 'timezone', property: 'timezone', type: 'VARCHAR(50)', required: true, default: 'America/Bogota' },
    { column: 'is_active', property: 'isActive', type: 'BOOLEAN', required: true, default: 'true' },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true }
  ];

  // Relaciones con otras tablas
  static relations = {
    roles: { model: 'Role', type: 'hasMany' },
    categories: { model: 'Category', type: 'hasMany' },
    suppliers: { model: 'Supplier', type: 'hasMany' },
    customers: { model: 'Customer', type: 'hasMany' },
    warehouses: { model: 'Warehouse', type: 'hasMany' }
  };

  // Empresas activas, ordenadas por nombre
  static async findActive() {
    return prisma.company.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  // Empresa con todo lo que depende directamente de ella
  static async findWithRelations(id) {
    return prisma.company.findUnique({
      where: { id },
      include: { roles: true, categories: true, suppliers: true, customers: true, warehouses: true }
    });
  }
}

module.exports = CompanyModel;