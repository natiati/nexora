const StockService = require('../services/stock.service');
const { AdjustStockSchema } = require('../dtos/stock.dto');
const { parsePagination } = require('../utils/pagination');
const { ok, okPage } = require('../utils/http-response');

class StockController {
  // GET /stock → 200
  static async list(companyId, query) {
    return okPage(await StockService.list(companyId, parsePagination(query)));
  }

  // GET /stock/movements → 200
  static async listMovements(companyId, query) {
    return okPage(await StockService.listMovements(companyId, parsePagination(query)));
  }

  // POST /stock/adjust → 200
  static async adjust(companyId, userId, datos) {
    const data = AdjustStockSchema.parse(datos);
    return ok(await StockService.adjust(companyId, { ...data, userId }));
  }
}

module.exports = StockController;
