const UnitService = require('../services/unit.service');
const { CreateUnitSchema } = require('../dtos/unit.dto');

class UnitController {
  static async list(req, res) {
    res.json(await UnitService.list());
  }

  static async create(req, res) {
    const data = CreateUnitSchema.parse(req.body);
    res.status(201).json(await UnitService.create(data));
  }
}

module.exports = UnitController;
