const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `suppliers`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class SupplierModel extends BaseModel {
  static prismaModel = prisma.supplier;

  static tableName = 'suppliers';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'company_id', property: 'companyId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'name', property: 'name', type: 'VARCHAR(150)', required: true },
    { column: 'tax_id', property: 'taxId', type: 'VARCHAR(30)', required: false },
    { column: 'email', property: 'email', type: 'VARCHAR(150)', required: false },
    { column: 'phone', property: 'phone', type: 'VARCHAR(30)', required: false },
    { column: 'address', property: 'address', type: 'TEXT', required: false },
    { column: 'contact_name', property: 'contactName', type: 'VARCHAR(120)', required: false },
    { column: 'notes', property: 'notes', type: 'TEXT', required: false },
    { column: 'is_active', property: 'isActive', type: 'BOOLEAN', required: true, default: 'true' },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true },
    { column: 'deleted_at', property: 'deletedAt', type: 'TIMESTAMP(3)', required: false }
  ];

  // Relaciones con otras tablas
  static relations = {
    company: { model: 'Company', foreignKey: 'company_id', type: 'belongsTo', required: true },
    purchaseOrders: { model: 'PurchaseOrder', type: 'hasMany' }
  };

  // Proveedores activos de una empresa (los inactivos no aparecen en órdenes nuevas)
  static async findActiveByCompany(companyId) {
    return prisma.supplier.findMany({ where: { companyId, isActive: true, deletedAt: null }, orderBy: { name: 'asc' } });
  }
}

module.exports = SupplierModel;