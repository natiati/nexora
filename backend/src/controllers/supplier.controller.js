const SupplierModel = require('../models/supplier.model');
const { CreateSupplierSchema } = require('../dtos/supplier.dto');

class SupplierController {
  static async list(req, res, next) {
    try {
      const suppliers = await SupplierModel.findAll({}, { orderBy: { createdAt: 'desc' } });
      res.json(suppliers);
    } catch (error) { next(error); }
  }

  static async create(req, res, next) {
    try {
      const data = CreateSupplierSchema.parse(req.body);
      const supplier = await SupplierModel.create(data);
      res.status(201).json(supplier);
    } catch (error) { next(error); }
  }
}

module.exports = SupplierController;
