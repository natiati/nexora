const InvoiceService = require('../services/invoice.service');
const { CreateInvoiceSchema, CreatePaymentSchema } = require('../dtos/invoice.dto');
const { parsePagination } = require('../utils/pagination');

class InvoiceController {
  static async create(req, res, next) {
    try {
      const data = CreateInvoiceSchema.parse(req.body);
      res.status(201).json(await InvoiceService.create({ ...data, userId: req.user.id }));
    } catch (error) { next(error); }
  }

  static async list(req, res, next) {
    try {
      const { data, total } = await InvoiceService.list(parsePagination(req.query));
      res.set('X-Total-Count', String(total));
      res.json(data);
    } catch (error) { next(error); }
  }

  static async registerPayment(req, res, next) {
    try {
      const data = CreatePaymentSchema.parse(req.body);
      res.json(await InvoiceService.registerPayment(req.params.id, { ...data, userId: req.user.id }));
    } catch (error) { next(error); }
  }
}

module.exports = InvoiceController;