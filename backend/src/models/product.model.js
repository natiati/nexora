const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');

class ProductModel extends BaseModel {
  static prismaModel = prisma.product;

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
}

module.exports = ProductModel;