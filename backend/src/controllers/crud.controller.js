const { parsePagination } = require('../utils/pagination');

// Controlador estándar de un catálogo: solo traduce HTTP ⇄ service, sin reglas de negocio.
// Express 5 envía al error-handler los errores de los handlers async.
function createCrudController(service, { createSchema, updateSchema }) {
  return {
    async list(req, res) {
      const { data, total } = await service.list(req.user.companyId, parsePagination(req.query));
      res.set('X-Total-Count', String(total));
      res.json(data);
    },

    async get(req, res) {
      res.json(await service.getById(req.user.companyId, req.params.id));
    },

    async create(req, res) {
      const data = createSchema.parse(req.body);
      res.status(201).json(await service.create(req.user.companyId, data));
    },

    async update(req, res) {
      const data = updateSchema.parse(req.body);
      res.json(await service.update(req.user.companyId, req.params.id, data));
    },

    async remove(req, res) {
      await service.remove(req.user.companyId, req.params.id);
      res.status(204).end();
    }
  };
}

module.exports = createCrudController;
