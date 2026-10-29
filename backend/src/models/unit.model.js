const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `units`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class UnitModel extends BaseModel {
  static prismaModel = prisma.unit;

  static tableName = 'units';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'name', property: 'name', type: 'VARCHAR(50)', required: true },
    { column: 'abbreviation', property: 'abbreviation', type: 'VARCHAR(15)', required: true },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' }
  ];

  // Relaciones con otras tablas
  static relations = {
    products: { model: 'Product', type: 'hasMany' }
  };

  static async findByAbbreviation(abbreviation) {
    return prisma.unit.findFirst({ where: { abbreviation } });
  }
}

module.exports = UnitModel;