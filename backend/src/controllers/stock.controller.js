const StockService = require('../services/stock.service');
const { AdjustStockSchema } = require('../dtos/stock.dto');
const { parsePagination } = require('../utils/pagination');

class StockController {
  static async list(req, res) {
    const { data, total } = await StockService.list(req.user.companyId, parsePagination(req.query));
    res.set('X-Total-Count', String(total));
    res.json(data);
  }

  static async listMovements(req, res) {
    const { data, total } = await StockService.listMovements(req.user.companyId, parsePagination(req.query));
    res.set('X-Total-Count', String(total));
    res.json(data);
  }

  static async adjust(req, res) {
    const data = AdjustStockSchema.parse(req.body);
    res.json(await StockService.adjust(req.user.companyId, { ...data, userId: req.user.id }));
  }
}

module.exports = StockController;
