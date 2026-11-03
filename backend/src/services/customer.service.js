const CustomerInteractionModel = require('../models/customer-interaction.model');
const CustomerModel = require('../models/customer.model');
const BaseCrudService = require('./base-crud.service');

class CustomerService extends BaseCrudService {
  static model = CustomerModel;
  static entityName = 'Cliente';
  static searchFields = ['name', 'code', 'taxId', 'email', 'city'];

  static async validate(companyId, data, id) {
    await this.assertUnique(companyId, 'code', data.code, id, 'Ya existe un cliente con ese código');
    await this.assertUnique(companyId, 'taxId', data.taxId, id, 'Ya existe un cliente con ese NIT');
  }

  // GET /customers/:id/interactions: historial del CRM
  static async listInteractions(companyId, customerId) {
    await this.getById(companyId, customerId);
    return CustomerInteractionModel.findByCustomer(customerId);
  }

  // POST /customers/:id/interactions
  static async addInteraction(companyId, customerId, userId, data) {
    await this.getById(companyId, customerId);
    return CustomerInteractionModel.create({
      ...data,
      interactionDate: data.interactionDate ?? new Date(),
      companyId,
      customerId,
      userId
    });
  }
}

module.exports = CustomerService;
