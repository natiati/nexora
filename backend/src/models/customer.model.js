const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `customers`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class CustomerModel extends BaseModel {
  static prismaModel = prisma.customer;

  static tableName = 'customers';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'company_id', property: 'companyId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'code', property: 'code', type: 'VARCHAR(30)', required: false },
    { column: 'name', property: 'name', type: 'VARCHAR(150)', required: true },
    { column: 'tax_id', property: 'taxId', type: 'VARCHAR(30)', required: false },
    { column: 'email', property: 'email', type: 'VARCHAR(150)', required: false },
    { column: 'phone', property: 'phone', type: 'VARCHAR(30)', required: false },
    { column: 'address', property: 'address', type: 'TEXT', required: false },
    { column: 'city', property: 'city', type: 'VARCHAR(100)', required: false },
    { column: 'credit_limit', property: 'creditLimit', type: 'NUMERIC(14,2)', required: false },
    { column: 'payment_terms', property: 'paymentTerms', type: 'VARCHAR(50)', required: false },
    { column: 'notes', property: 'notes', type: 'TEXT', required: false },
    { column: 'is_active', property: 'isActive', type: 'BOOLEAN', required: true, default: 'true' },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true },
    { column: 'deleted_at', property: 'deletedAt', type: 'TIMESTAMP(3)', required: false }
  ];

  // Relaciones con otras tablas
  static relations = {
    company: { model: 'Company', foreignKey: 'company_id', type: 'belongsTo', required: true },
    interactions: { model: 'CustomerInteraction', type: 'hasMany' },
    salesOrders: { model: 'SalesOrder', type: 'hasMany' }
  };

  static async findActiveByCompany(companyId) {
    return prisma.customer.findMany({ where: { companyId, isActive: true, deletedAt: null }, orderBy: { name: 'asc' } });
  }

  // Cliente con su historial de interacciones
  static async findWithInteractions(id) {
    return prisma.customer.findUnique({
      where: { id },
      include: { interactions: { orderBy: { interactionDate: 'desc' } } }
    });
  }
}

module.exports = CustomerModel;