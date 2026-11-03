const AppError = require('../utils/app-error');
const { slugify } = require('../utils/slug');
const CategoryModel = require('../models/category.model');
const ProductModel = require('../models/product.model');
const BaseCrudService = require('./base-crud.service');

class CategoryService extends BaseCrudService {
  static model = CategoryModel;
  static entityName = 'Categoría';

  static async validate(companyId, data, id) {
    if (!data.name) return;
    await this.assertUnique(companyId, 'slug', slugify(data.name), id, 'Ya existe una categoría con ese nombre');
  }

  static toCreateData(companyId, data) {
    return { ...data, companyId, slug: slugify(data.name) };
  }

  static async update(companyId, id, data) {
    return super.update(companyId, id, data.name ? { ...data, slug: slugify(data.name) } : data);
  }

  static async remove(companyId, id) {
    await this.getById(companyId, id);

    const products = await ProductModel.count({ categoryId: id, deletedAt: null });
    if (products > 0) {
      throw new AppError('La categoría tiene productos: muévelos a otra antes de eliminarla', 409);
    }

    await CategoryModel.softDelete(id);
  }
}

module.exports = CategoryService;
