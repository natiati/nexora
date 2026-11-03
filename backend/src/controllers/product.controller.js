const ProductService = require('../services/product.service');
const { CreateProductSchema, UpdateProductSchema } = require('../dtos/product.dto');
const createCrudController = require('./crud.controller');

module.exports = createCrudController(ProductService, { createSchema: CreateProductSchema, updateSchema: UpdateProductSchema });
