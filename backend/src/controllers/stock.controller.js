const StockService = require('../services/stock.service');
const { AdjustStockSchema } = require('../dtos/stock.dto');

class StockController {
  static async list(req, res, next) {
    try {
      res.json(await StockService.list());
    } catch (error) { next(error); }
  }

  static async adjust(req, res, next) {
    try {
      const data = AdjustStockSchema.parse(req.body);
      res.json(await StockService.adjust(data));
    } catch (error) { next(error); }
  }
}

module.exports = StockController;