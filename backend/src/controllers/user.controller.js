const UserService = require('../services/user.service');
const { CreateUserSchema, UpdateUserSchema } = require('../dtos/user.dto');
const { parsePagination } = require('../utils/pagination');
const { ok, created, noContent, okPage } = require('../utils/http-response');

class UserController {
  // GET /users → 200
  static async list(companyId, query) {
    return okPage(await UserService.list(companyId, parsePagination(query)));
  }

  // POST /users → 201
  static async create(companyId, datos) {
    const data = CreateUserSchema.parse(datos);
    return created(await UserService.create(companyId, data));
  }

  // PUT /users/:id → 200 (currentUserId: el usuario que hace la petición)
  static async update(companyId, userId, currentUserId, datos) {
    const data = UpdateUserSchema.parse(datos);
    return ok(await UserService.update(companyId, userId, currentUserId, data));
  }

  // DELETE /users/:id → 204
  static async remove(companyId, userId, currentUserId) {
    await UserService.remove(companyId, userId, currentUserId);
    return noContent();
  }
}

module.exports = UserController;
