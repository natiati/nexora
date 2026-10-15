const PurchaseOrderService = require('../services/purchase-order.service');
const {
  CreatePurchaseOrderSchema,
  ReceivePurchaseOrderSchema
} = require('../dtos/purchase-order.dto');

class PurchaseOrderController {
  static async create(req, res, next) {
    try {
      const data = CreatePurchaseOrderSchema.parse(req.body);
      res.status(201).json(await PurchaseOrderService.create(data));
    } catch (error) { next(error); }
  }

  static async list(req, res, next) {
    try {
      res.json(await PurchaseOrderService.list());
    } catch (error) { next(error); }
  }

  static async receive(req, res, next) {
    try {
      const { userId } = ReceivePurchaseOrderSchema.parse(req.body);
      res.json(await PurchaseOrderService.receive(req.params.id, userId));
    } catch (error) { next(error); }
  }
}

module.exports = PurchaseOrderController;