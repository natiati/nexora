const SupplierModel = require('../models/supplier.model');
const { CreateSupplierSchema } = require('../dtos/supplier.dto');
const { parsePagination } = require('../utils/pagination');

class SupplierController {
  static async list(req, res, next) {
    try {
      const { skip, take } = parsePagination(req.query);
      const where = { deletedAt: null };
      const [suppliers, total] = await Promise.all([
        SupplierModel.findAll(where, { orderBy: { createdAt: 'desc' }, skip, take }),
        SupplierModel.count(where)
      ]);
      res.set('X-Total-Count', String(total));
      res.json(suppliers);
    } catch (error) { next(error); }
  }

  static async create(req, res, next) {
    try {
      const data = CreateSupplierSchema.parse(req.body);
      res.status(201).json(await SupplierModel.create(data));
    } catch (error) { next(error); }
  }
}

module.exports = SupplierController;