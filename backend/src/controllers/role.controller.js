const RoleService = require('../services/role.service');
const { CreateRoleSchema, UpdateRoleSchema } = require('../dtos/role.dto');
const createCrudController = require('./crud.controller');

module.exports = createCrudController(RoleService, { createSchema: CreateRoleSchema, updateSchema: UpdateRoleSchema });
