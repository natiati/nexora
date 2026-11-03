const UserService = require('../services/user.service');
const { CreateUserSchema, UpdateUserSchema } = require('../dtos/user.dto');
const { parsePagination } = require('../utils/pagination');

class UserController {
  static async list(req, res) {
    const { data, total } = await UserService.list(req.user.companyId, parsePagination(req.query));
    res.set('X-Total-Count', String(total));
    res.json(data);
  }

  static async create(req, res) {
    const data = CreateUserSchema.parse(req.body);
    res.status(201).json(await UserService.create(req.user.companyId, data));
  }

  static async update(req, res) {
    const data = UpdateUserSchema.parse(req.body);
    res.json(await UserService.update(req.user.companyId, req.params.id, req.user.id, data));
  }

  static async remove(req, res) {
    await UserService.remove(req.user.companyId, req.params.id, req.user.id);
    res.status(204).end();
  }
}

module.exports = UserController;
