const AppError = require('../utils/app-error');
const WarehouseModel = require('../models/warehouse.model');
const BaseCrudService = require('./base-crud.service');

class WarehouseService extends BaseCrudService {
  static model = WarehouseModel;
  static entityName = 'Almacén';
  static searchFields = ['name', 'code'];
  static hasSoftDelete = false;

  static async validate(companyId, data, id) {
    await this.assertUnique(companyId, 'code', data.code, id, 'Ya existe un almacén con ese código');
  }

  // Solo puede haber un almacén predeterminado por empresa; el primero siempre lo es
  static async create(companyId, data) {
    await this.validate(companyId, data);
    const count = await WarehouseModel.count({ companyId });
    const isDefault = data.isDefault || count === 0;

    return WarehouseModel.transaction(async (tx) => {
      if (isDefault) await WarehouseModel.updateMany({ companyId }, { isDefault: false }, tx);
      return WarehouseModel.create({ ...data, companyId, isDefault }, {}, tx);
    });
  }

  static async update(companyId, id, data) {
    const current = await this.getById(companyId, id);
    await this.validate(companyId, data, id);

    if (current.isDefault && (data.isDefault === false || data.isActive === false)) {
      throw new AppError('Marca otro almacén como predeterminado antes de cambiar este', 409);
    }

    if (data.isDefault && (data.isActive === false || (!current.isActive && data.isActive !== true))) {
      throw new AppError('El almacén predeterminado debe estar activo', 409);
    }

    return WarehouseModel.transaction(async (tx) => {
      if (data.isDefault) await WarehouseModel.updateMany({ companyId }, { isDefault: false }, tx);
      return WarehouseModel.update(id, data, {}, tx);
    });
  }
}

module.exports = WarehouseService;
