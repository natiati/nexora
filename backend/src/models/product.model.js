const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

/**
 * Modelo de la tabla `products`.
 * Hereda de BaseModel el CRUD común (findAll, findById, create, update, remove, count).
 * Las columnas y relaciones coinciden con schema.prisma.
 */
class ProductModel extends BaseModel {
  static prismaModel = prisma.product;

  static tableName = 'products';

  // Columnas de la tabla: nombre en la base de datos, nombre en Prisma, tipo, si es obligatoria y llave
  static columns = [
    { column: 'id', property: 'id', type: 'TEXT', required: true, key: 'PK', default: 'uuid()' },
    { column: 'category_id', property: 'categoryId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'unit_id', property: 'unitId', type: 'TEXT', required: true, key: 'FK' },
    { column: 'sku', property: 'sku', type: 'VARCHAR(60)', required: true },
    { column: 'barcode', property: 'barcode', type: 'VARCHAR(50)', required: false },
    { column: 'name', property: 'name', type: 'VARCHAR(200)', required: true },
    { column: 'description', property: 'description', type: 'TEXT', required: false },
    { column: 'cost_price', property: 'costPrice', type: 'NUMERIC(14,2)', required: true },
    { column: 'sale_price', property: 'salePrice', type: 'NUMERIC(14,2)', required: true },
    { column: 'min_stock', property: 'minStock', type: 'NUMERIC(12,3)', required: true, default: '0' },
    { column: 'is_active', property: 'isActive', type: 'BOOLEAN', required: true, default: 'true' },
    { column: 'track_stock', property: 'trackStock', type: 'BOOLEAN', required: true, default: 'true' },
    { column: 'created_at', property: 'createdAt', type: 'TIMESTAMP(3)', required: true, default: 'now()' },
    { column: 'updated_at', property: 'updatedAt', type: 'TIMESTAMP(3)', required: true },
    { column: 'deleted_at', property: 'deletedAt', type: 'TIMESTAMP(3)', required: false }
  ];

  // Relaciones con otras tablas
  static relations = {
    category: { model: 'Category', foreignKey: 'category_id', type: 'belongsTo', required: true },
    unit: { model: 'Unit', foreignKey: 'unit_id', type: 'belongsTo', required: true }
  };

  // Devuelve un Map(id → producto) para resolver varios productos en una sola consulta
  static async findMapByIds(ids) {
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    return new Map(products.map((product) => [product.id, product]));
  }

  // true si todos los ids existen en la tabla products
  static async existAll(ids) {
    const unique = [...new Set(ids)];
    const found = await ProductModel.findMapByIds(unique);
    return found.size === unique.length;
  }

  static async findBySku(sku) {
    return prisma.product.findFirst({ where: { sku, deletedAt: null } });
  }

  static async findByCategory(categoryId) {
    return prisma.product.findMany({ where: { categoryId, deletedAt: null }, orderBy: { name: 'asc' } });
  }
}

module.exports = ProductModel;