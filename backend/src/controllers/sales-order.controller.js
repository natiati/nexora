const SalesOrderService = require('../services/sales-order.service');
const { CreateSalesOrderSchema } = require('../dtos/sales-order.dto');
const { parsePagination } = require('../utils/pagination');

class SalesOrderController {
  static async create(req, res) {
    const data = CreateSalesOrderSchema.parse(req.body);
    res.status(201).json(await SalesOrderService.create(req.user.companyId, { ...data, userId: req.user.id }));
  }

  static async list(req, res) {
    const { data, total } = await SalesOrderService.list(req.user.companyId, parsePagination(req.query));
    res.set('X-Total-Count', String(total));
    res.json(data);
  }

  static async confirm(req, res) {
    res.json(await SalesOrderService.confirm(req.user.companyId, req.params.id));
  }

  static async deliver(req, res) {
    res.json(await SalesOrderService.deliver(req.user.companyId, req.params.id, req.user.id));
  }

  static async cancel(req, res) {
    res.json(await SalesOrderService.cancel(req.user.companyId, req.params.id));
  }
}

module.exports = SalesOrderController;
