const ProductService = require('../services/product.service');
const { CreateProductSchema, UpdateProductSchema } = require('../dtos/product.dto');
const createCrudController = require('./crud.controller');

// Catálogo estándar: listar (200), consultar (200), crear (201), actualizar (200) y eliminar (204)
const ProductController = createCrudController(ProductService, {
  createSchema: CreateProductSchema,
  updateSchema: UpdateProductSchema
});

module.exports = ProductController;
