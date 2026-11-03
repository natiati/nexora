const WarehouseService = require('../services/warehouse.service');
const { CreateWarehouseSchema, UpdateWarehouseSchema } = require('../dtos/warehouse.dto');
const createCrudController = require('./crud.controller');

module.exports = createCrudController(WarehouseService, { createSchema: CreateWarehouseSchema, updateSchema: UpdateWarehouseSchema });
