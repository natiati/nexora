const AppError = require('../utils/app-error');
const CompanyModel = require('../models/company.model');

class CompanyService {
  static async get(companyId) {
    const company = await CompanyModel.findById(companyId);
    if (!company) throw new AppError('Empresa no encontrada', 404);
    return company;
  }

  static async update(companyId, data) {
    // Verifica existencia antes de actualizar para lanzar un 404 explícito
    await this.get(companyId);
    return CompanyModel.update(companyId, data);
  }
}

module.exports = CompanyService;
