const DashboardService = require('../services/dashboard.service');
const { DashboardQuerySchema } = require('../dtos/dashboard.dto');
const { ok } = require('../utils/http-response');

class DashboardController {
  // GET /dashboard?months=6 → 200
  static async summary(companyId, filtros) {
    const { months } = DashboardQuerySchema.parse(filtros);
    return ok(await DashboardService.summary(companyId, { months }));
  }
}

module.exports = DashboardController;
