const CategoryService = require('../services/category.service');
const { CreateCategorySchema, UpdateCategorySchema } = require('../dtos/category.dto');
const createCrudController = require('./crud.controller');

// Catálogo estándar: listar (200), consultar (200), crear (201), actualizar (200) y eliminar (204)
const CategoryController = createCrudController(CategoryService, {
  createSchema: CreateCategorySchema,
  updateSchema: UpdateCategorySchema
});

module.exports = CategoryController;
