const CompanyService = require('../services/company.service');
const { UpdateCompanySchema } = require('../dtos/company.dto');

class CompanyController {
  static async get(req, res) {
    res.json(await CompanyService.get(req.user.companyId));
  }

  static async update(req, res) {
    const data = UpdateCompanySchema.parse(req.body);
    res.json(await CompanyService.update(req.user.companyId, data));
  }
}

module.exports = CompanyController;
