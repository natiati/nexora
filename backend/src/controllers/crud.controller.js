const { parsePagination } = require('../utils/pagination');
const { ok, created, noContent, okPage } = require('../utils/http-response');

/**
 * Controlador estándar de un catálogo (listar, consultar, crear, actualizar, eliminar).
 * Recibe valores simples (no conoce Express): valida con el DTO, llama al service
 * y devuelve el código HTTP con el resultado. No contiene reglas de negocio.
 */
function createCrudController(service, { createSchema, updateSchema }) {
  return {
    // GET /recurso → 200
    async list(companyId, query) {
      return okPage(await service.list(companyId, parsePagination(query)));
    },

    // GET /recurso/:id → 200
    async get(companyId, id) {
      return ok(await service.getById(companyId, id));
    },

    // POST /recurso → 201
    async create(companyId, datos) {
      const data = createSchema.parse(datos);
      return created(await service.create(companyId, data));
    },

    // PUT /recurso/:id → 200
    async update(companyId, id, datos) {
      const data = updateSchema.parse(datos);
      return ok(await service.update(companyId, id, data));
    },

    // DELETE /recurso/:id → 204
    async remove(companyId, id) {
      await service.remove(companyId, id);
      return noContent();
    }
  };
}

module.exports = createCrudController;
