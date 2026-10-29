const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `warehouses`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class WarehouseModel extends BaseModel {
  static prismaModel = prisma.warehouse;

  static tableName = 'warehouses';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'company_id', property: 'companyId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'name', property: 'name', type: 'VARCHAR(120)', required: true },
    { column: 'code', property: 'code', type: 'VARCHAR(20)', required: false },
    { column: 'address', property: 'address', type: 'TEXT', required: false },
    { column: 'is_active', property: 'isActive', type: 'BOOLEAN', required: true, default: 'true' },
    { column: 'is_default', property: 'isDefault', type: 'BOOLEAN', required: true, default: 'false' },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true }
  ];

  // Relaciones con otras tablas
  static relations = {
    company: { model: 'Company', foreignKey: 'company_id', type: 'belongsTo', required: true },
    stockLevels: { model: 'StockLevel', type: 'hasMany' },
    stockMovements: { model: 'StockMovement', type: 'hasMany' }
  };

  static async findByCompany(companyId) {
    return prisma.warehouse.findMany({ where: { companyId }, orderBy: { name: 'asc' } });
  }

  // Almacén predeterminado de la empresa (lo usan compras y ventas)
  static async findDefault(companyId) {
    return prisma.warehouse.findFirst({ where: { companyId, isDefault: true } });
  }
}

module.exports = WarehouseModel;