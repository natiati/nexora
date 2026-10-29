const PurchaseOrderService = require('../services/purchase-order.service');
const { CreatePurchaseOrderSchema } = require('../dtos/purchase-order.dto');
const { parsePagination } = require('../utils/pagination');

class PurchaseOrderController {
  static async create(req, res, next) {
    try {
      const data = CreatePurchaseOrderSchema.parse(req.body);
      res.status(201).json(await PurchaseOrderService.create({ ...data, userId: req.user.id }));
    } catch (error) { next(error); }
  }

  static async list(req, res, next) {
    try {
      const { data, total } = await PurchaseOrderService.list(parsePagination(req.query));
      res.set('X-Total-Count', String(total));
      res.json(data);
    } catch (error) { next(error); }
  }

  static async receive(req, res, next) {
    try {
      res.json(await PurchaseOrderService.receive(req.params.id, req.user.id));
    } catch (error) { next(error); }
  }
}

module.exports = PurchaseOrderController;
