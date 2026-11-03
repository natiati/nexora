const AppError = require('../utils/app-error');
const UnitModel = require('../models/unit.model');

// Las unidades son compartidas por todas las empresas (la tabla no tiene company_id),
// por eso se pueden consultar y crear, pero no editar ni eliminar.
class UnitService {
  static async list() {
    return UnitModel.findAll({}, { orderBy: { name: 'asc' } });
  }

  static async create(data) {
    const existing = await UnitModel.findByAbbreviation(data.abbreviation);
    if (existing) throw new AppError('Ya existe una unidad con esa abreviatura', 409);
    return UnitModel.create(data);
  }
}

module.exports = UnitService;
