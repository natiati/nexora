const AppError = require('../utils/app-error');
const CategoryModel = require('../models/category.model');
const ProductModel = require('../models/product.model');
const UnitModel = require('../models/unit.model');
const BaseCrudService = require('./base-crud.service');

class ProductService extends BaseCrudService {
  static model = ProductModel;
  static entityName = 'Producto';
  static searchFields = ['name', 'sku', 'barcode'];
  static include = { category: true, unit: true };

  // products no tiene company_id: la empresa se alcanza por la categoría
  static scope(companyId) {
    return { deletedAt: null, category: { companyId } };
  }

  static async validate(companyId, data, id) {
    if (data.categoryId) {
      const category = await CategoryModel.findOne({ id: data.categoryId, companyId, deletedAt: null });
      if (!category) throw new AppError('Categoría no encontrada', 404);
    }

    if (data.unitId && !(await UnitModel.findById(data.unitId))) {
      throw new AppError('Unidad no encontrada', 404);
    }

    await this.assertUnique(companyId, 'sku', data.sku, id, 'Ya existe un producto con ese SKU');
  }

  static toCreateData(companyId, data) {
    return data;
  }

  // Comprueba que todos los productos de una orden existan, estén activos y sean de la empresa
  static async assertUsable(companyId, productIds) {
    const unique = [...new Set(productIds)];
    const found = await ProductModel.count({
      id: { in: unique },
      isActive: true,
      ...this.scope(companyId)
    });

    if (found !== unique.length) {
      throw new AppError('Alguno de los productos no existe o está inactivo', 404);
    }
  }
}

module.exports = ProductService;
