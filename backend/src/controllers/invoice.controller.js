const InvoiceService = require('../services/invoice.service');
const { CreateInvoiceSchema, CreatePaymentSchema } = require('../dtos/invoice.dto');
const { parsePagination } = require('../utils/pagination');
const { ok, created, okPage } = require('../utils/http-response');

class InvoiceController {
  // POST /invoices → 201
  static async create(companyId, userId, datos) {
    const data = CreateInvoiceSchema.parse(datos); //el dto valida los datos y los transforma a un objeto plano
    return created(await InvoiceService.create(companyId, { ...data, userId })); //llamamos al servicio para crear la factura y devolvemos el resultado con el código 201
  }

  // GET /invoices → 200
  static async list(companyId, query) {
    return okPage(await InvoiceService.list(companyId, parsePagination(query)));
  }

  // GET /invoices/:id → 200
  static async get(companyId, invoiceId) {
    return ok(await InvoiceService.getById(companyId, invoiceId));
  }

  // POST /invoices/:id/payments → 200
  static async registerPayment(companyId, invoiceId, userId, datos) {
    const data = CreatePaymentSchema.parse(datos);
    return ok(await InvoiceService.registerPayment(companyId, invoiceId, { ...data, userId }));
  }

  // POST /invoices/:id/cancel → 200
  static async cancel(companyId, invoiceId) {
    return ok(await InvoiceService.cancel(companyId, invoiceId));
  }
}

module.exports = InvoiceController;
