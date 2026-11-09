const SalesOrderService = require('../services/sales-order.service');
const { CreateSalesOrderSchema } = require('../dtos/sales-order.dto');
const { parsePagination } = require('../utils/pagination');
const { ok, created, okPage } = require('../utils/http-response');

class SalesOrderController {
  // POST /sales-orders → 201
  static async create(companyId, userId, datos) {
    const data = CreateSalesOrderSchema.parse(datos);
    return created(await SalesOrderService.create(companyId, { ...data, userId }));
  }

  // GET /sales-orders → 200
  static async list(companyId, query) {
    return okPage(await SalesOrderService.list(companyId, parsePagination(query)));
  }

  // GET /sales-orders/:id → 200
  static async get(companyId, orderId) {
    return ok(await SalesOrderService.getById(companyId, orderId));
  }

  // POST /sales-orders/:id/confirm → 200
  static async confirm(companyId, orderId) {
    return ok(await SalesOrderService.confirm(companyId, orderId));
  }

  // POST /sales-orders/:id/deliver → 200
  static async deliver(companyId, orderId, userId) {
    return ok(await SalesOrderService.deliver(companyId, orderId, userId));
  }

  // POST /sales-orders/:id/cancel → 200
  static async cancel(companyId, orderId) {
    return ok(await SalesOrderService.cancel(companyId, orderId));
  }
}

module.exports = SalesOrderController;
