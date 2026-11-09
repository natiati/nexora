const CustomerService = require('../services/customer.service');
const { CreateCustomerSchema, UpdateCustomerSchema, CreateInteractionSchema } = require('../dtos/customer.dto');
const { ok, created } = require('../utils/http-response');
const createCrudController = require('./crud.controller');

const CustomerController = {
  ...createCrudController(CustomerService, {
    createSchema: CreateCustomerSchema,
    updateSchema: UpdateCustomerSchema
  }),

  // GET /customers/:id/interactions → 200
  async listInteractions(companyId, customerId) {
    return ok(await CustomerService.listInteractions(companyId, customerId));
  },

  // POST /customers/:id/interactions → 201
  async addInteraction(companyId, customerId, userId, datos) {
    const data = CreateInteractionSchema.parse(datos);
    return created(await CustomerService.addInteraction(companyId, customerId, userId, data));
  }
};

module.exports = CustomerController;
