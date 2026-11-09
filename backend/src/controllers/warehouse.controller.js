const WarehouseService = require('../services/warehouse.service');
const { CreateWarehouseSchema, UpdateWarehouseSchema } = require('../dtos/warehouse.dto');
const createCrudController = require('./crud.controller');

// Catálogo estándar: listar (200), consultar (200), crear (201), actualizar (200) y eliminar (204)
const WarehouseController = createCrudController(WarehouseService, {
  createSchema: CreateWarehouseSchema,
  updateSchema: UpdateWarehouseSchema
});

module.exports = WarehouseController;
