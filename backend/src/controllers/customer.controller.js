const CustomerService = require('../services/customer.service');
const { CreateCustomerSchema, UpdateCustomerSchema, CreateInteractionSchema } = require('../dtos/customer.dto');
const createCrudController = require('./crud.controller');

module.exports = {
  ...createCrudController(CustomerService, {
    createSchema: CreateCustomerSchema,
    updateSchema: UpdateCustomerSchema
  }),

  async listInteractions(req, res) {
    res.json(await CustomerService.listInteractions(req.user.companyId, req.params.id));
  },

  async addInteraction(req, res) {
    const data = CreateInteractionSchema.parse(req.body);
    res.status(201).json(await CustomerService.addInteraction(req.user.companyId, req.params.id, req.user.id, data));
  }
};
