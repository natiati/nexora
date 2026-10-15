const InvoiceService = require('../services/invoice.service');
const { CreateInvoiceSchema, CreatePaymentSchema } = require('../dtos/invoice.dto');

class InvoiceController {
  static async create(req, res, next) {
    try {
      const data = CreateInvoiceSchema.parse(req.body);
      res.status(201).json(await InvoiceService.create(data));
    } catch (error) { next(error); }
  }

  static async list(req, res, next) {
    try {
      res.json(await InvoiceService.list());
    } catch (error) { next(error); }
  }

  static async registerPayment(req, res, next) {
    try {
      const data = CreatePaymentSchema.parse(req.body);
      res.json(await InvoiceService.registerPayment(req.params.id, data));
    } catch (error) { next(error); }
  }
}

module.exports = InvoiceController;