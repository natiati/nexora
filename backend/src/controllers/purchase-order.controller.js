const PurchaseOrderService = require('../services/purchase-order.service');
const { CreatePurchaseOrderSchema } = require('../dtos/purchase-order.dto');
const { parsePagination } = require('../utils/pagination');
const { ok, created, okPage } = require('../utils/http-response');

class PurchaseOrderController {
  // POST /purchase-orders → 201
  static async create(companyId, userId, datos) {
    const data = CreatePurchaseOrderSchema.parse(datos);
    return created(await PurchaseOrderService.create(companyId, { ...data, userId }));
  }

  // GET /purchase-orders → 200
  static async list(companyId, query) {
    return okPage(await PurchaseOrderService.list(companyId, parsePagination(query)));
  }

  // GET /purchase-orders/:id → 200
  static async get(companyId, orderId) {
    return ok(await PurchaseOrderService.getById(companyId, orderId));
  }

  // POST /purchase-orders/:id/receive → 200
  static async receive(companyId, orderId, userId) {
    return ok(await PurchaseOrderService.receive(companyId, orderId, userId));
  }

  // POST /purchase-orders/:id/cancel → 200
  static async cancel(companyId, orderId) {
    return ok(await PurchaseOrderService.cancel(companyId, orderId));
  }
}

module.exports = PurchaseOrderController;
