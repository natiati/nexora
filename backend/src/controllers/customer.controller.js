const CustomerModel = require('../models/customer.model');
const { CreateCustomerSchema } = require('../dtos/customer.dto');

class CustomerController {
  static async list(req, res, next) {
    try {
      const customers = await CustomerModel.findAll({}, { orderBy: { createdAt: 'desc' } });
      res.json(customers);
    } catch (error) { next(error); }
  }

  static async create(req, res, next) {
    try {
      const data = CreateCustomerSchema.parse(req.body);
      const customer = await CustomerModel.create(data);
      res.status(201).json(customer);
    } catch (error) { next(error); }
  }
}

module.exports = CustomerController;
// hace parte de controllers porq tiene res, req, next, y hace parte de models porq tiene CustomerModel