const ProductModel = require('../models/product.model');
const { CreateProductSchema, UpdateProductSchema } = require('../dtos/product.dto');

class ProductController {
  static async list(req, res, next) {
    try {
      // Mismo include y orden que ya tenías en routes/products.js
      const products = await ProductModel.findAll({}, {
        include: { category: true, unit: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json(products);
    } catch (error) { next(error); }
  }

  static async create(req, res, next) {
    try {
      const data = CreateProductSchema.parse(req.body);
      const product = await ProductModel.create(data);
      res.status(201).json(product);
    } catch (error) { next(error); }
  }

  static async update(req, res, next) {
    try {
      const data = UpdateProductSchema.parse(req.body);
      const product = await ProductModel.update(req.params.id, data);
      res.json(product);
    } catch (error) { next(error); }
  }
}

module.exports = ProductController;