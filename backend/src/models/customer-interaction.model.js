const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `customer_interactions`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class CustomerInteractionModel extends BaseModel {
  static prismaModel = prisma.customerInteraction;

  static tableName = 'customer_interactions';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'company_id', property: 'companyId', type: 'TEXT', required: true },
    { column: 'customer_id', property: 'customerId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'user_id', property: 'userId', type: 'TEXT', required: true },
    { column: 'type', property: 'type', type: 'VARCHAR(30)', required: true },
    { column: 'subject', property: 'subject', type: 'VARCHAR(200)', required: false },
    { column: 'content', property: 'content', type: 'TEXT', required: true },
    { column: 'interaction_date', property: 'interactionDate', type: 'TIMESTAMP(3)', required: true },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' }
  ];

  // Relaciones con otras tablas
  static relations = {
    customer: { model: 'Customer', foreignKey: 'customer_id', type: 'belongsTo', required: true }
  };

  // Historial de un cliente, de la más reciente a la más antigua
  static async findByCustomer(customerId) {
    return prisma.customerInteraction.findMany({ where: { customerId }, orderBy: { interactionDate: 'desc' } });
  }
}

module.exports = CustomerInteractionModel;