const CompanyService = require('../services/company.service');
const { UpdateCompanySchema } = require('../dtos/company.dto');
const { ok } = require('../utils/http-response');

class CompanyController {
  // GET /company → 200
  static async get(companyId) {
    return ok(await CompanyService.get(companyId));
  }

  // PUT /company → 200
  static async update(companyId, datos) {
    const data = UpdateCompanySchema.parse(datos);
    return ok(await CompanyService.update(companyId, data));
  }
}

module.exports = CompanyController;
