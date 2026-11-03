const PurchaseOrderService = require('../services/purchase-order.service');
const { CreatePurchaseOrderSchema } = require('../dtos/purchase-order.dto');
const { parsePagination } = require('../utils/pagination');

class PurchaseOrderController {
  static async create(req, res) {
    const data = CreatePurchaseOrderSchema.parse(req.body);
    res.status(201).json(await PurchaseOrderService.create(req.user.companyId, { ...data, userId: req.user.id }));
  }

  static async list(req, res) {
    const { data, total } = await PurchaseOrderService.list(req.user.companyId, parsePagination(req.query));
    res.set('X-Total-Count', String(total));
    res.json(data);
  }

  static async receive(req, res) {
    res.json(await PurchaseOrderService.receive(req.user.companyId, req.params.id, req.user.id));
  }

  static async cancel(req, res) {
    res.json(await PurchaseOrderService.cancel(req.user.companyId, req.params.id));
  }
}

module.exports = PurchaseOrderController;
