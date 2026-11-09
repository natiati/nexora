const SupplierService = require('../services/supplier.service');
const { CreateSupplierSchema, UpdateSupplierSchema } = require('../dtos/supplier.dto');
const createCrudController = require('./crud.controller');

// Catálogo estándar: listar (200), consultar (200), crear (201), actualizar (200) y eliminar (204)
const SupplierController = createCrudController(SupplierService, {
  createSchema: CreateSupplierSchema,
  updateSchema: UpdateSupplierSchema
});

module.exports = SupplierController;
