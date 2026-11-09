const RoleService = require('../services/role.service');
const { CreateRoleSchema, UpdateRoleSchema } = require('../dtos/role.dto');
const createCrudController = require('./crud.controller');

// Catálogo estándar: listar (200), consultar (200), crear (201), actualizar (200) y eliminar (204)
const RoleController = createCrudController(RoleService, {
  createSchema: CreateRoleSchema,
  updateSchema: UpdateRoleSchema
});

module.exports = RoleController;
