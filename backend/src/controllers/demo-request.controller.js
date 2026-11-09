const DemoRequestService = require('../services/demo-request.service');
const { CreateDemoRequestSchema } = require('../dtos/demo-request.dto');
const { parsePagination } = require('../utils/pagination');
const { created, okPage } = require('../utils/http-response');

class DemoRequestController {
  // POST /demo-requests (pública) → 201
  static async create(datos) {
    const data = CreateDemoRequestSchema.parse(datos);
    return created(await DemoRequestService.create(data));
  }

  // GET /demo-requests → 200
  static async list(companyId, query) {
    return okPage(await DemoRequestService.list(companyId, parsePagination(query)));
  }
}

module.exports = DemoRequestController;
