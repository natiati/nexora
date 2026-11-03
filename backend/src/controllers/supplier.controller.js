const SupplierService = require('../services/supplier.service');
const { CreateSupplierSchema, UpdateSupplierSchema } = require('../dtos/supplier.dto');
const createCrudController = require('./crud.controller');

module.exports = createCrudController(SupplierService, { createSchema: CreateSupplierSchema, updateSchema: UpdateSupplierSchema });
