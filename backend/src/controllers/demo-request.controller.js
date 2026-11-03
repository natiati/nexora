const DemoRequestService = require('../services/demo-request.service');
const { CreateDemoRequestSchema } = require('../dtos/demo-request.dto');
const { parsePagination } = require('../utils/pagination');

class DemoRequestController {
  static async create(req, res) {
    const data = CreateDemoRequestSchema.parse(req.body);
    res.status(201).json(await DemoRequestService.create(data));
  }

  static async list(req, res) {
    const { data, total } = await DemoRequestService.list(req.user.companyId, parsePagination(req.query));
    res.set('X-Total-Count', String(total));
    res.json(data);
  }
}

module.exports = DemoRequestController;
