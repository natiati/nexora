const CategoryService = require('../services/category.service');
const { CreateCategorySchema, UpdateCategorySchema } = require('../dtos/category.dto');
const createCrudController = require('./crud.controller');

module.exports = createCrudController(CategoryService, { createSchema: CreateCategorySchema, updateSchema: UpdateCategorySchema });
