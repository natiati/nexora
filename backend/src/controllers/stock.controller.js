const StockService = require('../services/stock.service');
const { AdjustStockSchema } = require('../dtos/stock.dto');
const { parsePagination } = require('../utils/pagination');

class StockController {
  static async list(req, res, next) {
    try {
      const { data, total } = await StockService.list(parsePagination(req.query));
      res.set('X-Total-Count', String(total));
      res.json(data);
    } catch (error) { next(error); }
  }

  static async adjust(req, res, next) {
    try {
      const data = AdjustStockSchema.parse(req.body);
      res.json(await StockService.adjust({ ...data, userId: req.user.id }));
    } catch (error) { next(error); }
  }
}

module.exports = StockController;