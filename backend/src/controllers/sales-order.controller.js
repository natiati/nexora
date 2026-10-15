const SalesOrderService = require('../services/sales-order.service');
const { CreateSalesOrderSchema, ConfirmSalesOrderSchema } = require('../dtos/sales-order.dto');

class SalesOrderController {
  static async create(req, res, next) {
    try {
      const data = CreateSalesOrderSchema.parse(req.body);
      res.status(201).json(await SalesOrderService.create(data));
    } catch (error) { next(error); }
  }

  static async list(req, res, next) {
    try {
      res.json(await SalesOrderService.list());
    } catch (error) { next(error); }
  }

  static async confirm(req, res, next) {
    try {
      const { userId } = ConfirmSalesOrderSchema.parse(req.body);
      res.json(await SalesOrderService.confirm(req.params.id, userId));
    } catch (error) { next(error); }
  }
}

module.exports = SalesOrderController;