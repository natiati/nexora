const UnitService = require('../services/unit.service');
const { CreateUnitSchema } = require('../dtos/unit.dto');
const { ok, created } = require('../utils/http-response');

class UnitController {
  // GET /units → 200
  static async list() {
    return ok(await UnitService.list());
  }

  // POST /units → 201
  static async create(datos) {
    const data = CreateUnitSchema.parse(datos);
    return created(await UnitService.create(data));
  }
}

module.exports = UnitController;
