const InvoiceService = require('../services/invoice.service');
const { CreateInvoiceSchema, CreatePaymentSchema } = require('../dtos/invoice.dto');
const { parsePagination } = require('../utils/pagination');

class InvoiceController {
  static async create(req, res) {
    const data = CreateInvoiceSchema.parse(req.body);
    res.status(201).json(await InvoiceService.create(req.user.companyId, { ...data, userId: req.user.id }));
  }

  static async list(req, res) {
    const { data, total } = await InvoiceService.list(req.user.companyId, parsePagination(req.query));
    res.set('X-Total-Count', String(total));
    res.json(data);
  }

  static async registerPayment(req, res) {
    const data = CreatePaymentSchema.parse(req.body);
    res.json(await InvoiceService.registerPayment(req.user.companyId, req.params.id, { ...data, userId: req.user.id }));
  }

  static async cancel(req, res) {
    res.json(await InvoiceService.cancel(req.user.companyId, req.params.id));
  }
}

module.exports = InvoiceController;
