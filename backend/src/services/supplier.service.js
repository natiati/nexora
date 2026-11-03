const SupplierModel = require('../models/supplier.model');
const BaseCrudService = require('./base-crud.service');

class SupplierService extends BaseCrudService {
  static model = SupplierModel;
  static entityName = 'Proveedor';
  static searchFields = ['name', 'taxId', 'email', 'contactName'];

  static async validate(companyId, data, id) {
    await this.assertUnique(companyId, 'taxId', data.taxId, id, 'Ya existe un proveedor con ese NIT');
  }
}

module.exports = SupplierService;
