const DashboardService = require('../services/dashboard.service');
const { DashboardQuerySchema } = require('../dtos/dashboard.dto');

class DashboardController {
  static async summary(req, res) {
    const { months } = DashboardQuerySchema.parse(req.query);
    res.json(await DashboardService.summary(req.user.companyId, { months }));
  }
}

module.exports = DashboardController;
