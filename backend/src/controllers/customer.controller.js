const CustomerModel = require('../models/customer.model');
const { CreateCustomerSchema } = require('../dtos/customer.dto');
const { parsePagination } = require('../utils/pagination');

class CustomerController {
  static async list(req, res, next) {
    try {
      const { skip, take } = parsePagination(req.query);
      const where = { deletedAt: null };
      const [customers, total] = await Promise.all([
        CustomerModel.findAll(where, { orderBy: { createdAt: 'desc' }, skip, take }),
        CustomerModel.count(where)
      ]);
      res.set('X-Total-Count', String(total));
      res.json(customers);
    } catch (error) { next(error); }
  }

  static async create(req, res, next) {
    try {
      const data = CreateCustomerSchema.parse(req.body);
      res.status(201).json(await CustomerModel.create(data));
    } catch (error) { next(error); }
  }
}

module.exports = CustomerController;