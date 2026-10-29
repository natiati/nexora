const ProductModel = require('../models/product.model');
const { CreateProductSchema, UpdateProductSchema } = require('../dtos/product.dto');
const { parsePagination } = require('../utils/pagination');

class ProductController {
  static async list(req, res, next) {
    try {
      const { skip, take } = parsePagination(req.query);
      const where = { deletedAt: null };
      const [products, total] = await Promise.all([
        ProductModel.findAll(where, {
          include: { category: true, unit: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        ProductModel.count(where)
      ]);
      res.set('X-Total-Count', String(total));
      res.json(products);
    } catch (error) { next(error); }
  }

  static async create(req, res, next) {
    try {
      const data = CreateProductSchema.parse(req.body);
      res.status(201).json(await ProductModel.create(data));
    } catch (error) { next(error); }
  }

  static async update(req, res, next) {
    try {
      const data = UpdateProductSchema.parse(req.body);
      res.json(await ProductModel.update(req.params.id, data));
    } catch (error) { next(error); }
  }
}

module.exports = ProductController;