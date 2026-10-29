const SalesOrderService = require('../services/sales-order.service');
const { CreateSalesOrderSchema } = require('../dtos/sales-order.dto');
const { parsePagination } = require('../utils/pagination');

class SalesOrderController {
  static async create(req, res, next) {
    try {
      const data = CreateSalesOrderSchema.parse(req.body);
      res.status(201).json(await SalesOrderService.create({ ...data, userId: req.user.id }));
    } catch (error) { next(error); }
  }

  static async list(req, res, next) {
    try {
      const { data, total } = await SalesOrderService.list(parsePagination(req.query));
      res.set('X-Total-Count', String(total));
      res.json(data);
    } catch (error) { next(error); }
  }

  static async confirm(req, res, next) {
    try {
      res.json(await SalesOrderService.confirm(req.params.id, req.user.id));
    } catch (error) { next(error); }
  }
}

module.exports = SalesOrderController;