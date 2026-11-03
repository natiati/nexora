const { z } = require('zod');
const { optionalText, optionalLongText, optionalDate, requiredText, id } = require('./common');

const CreateInvoiceSchema = z.object({
  salesOrderId: id(),
  invoiceNumber: optionalText(30),
  dueDate: optionalDate(),
  notes: optionalLongText()
});

const CreatePaymentSchema = z.object({
  amount: z.coerce.number().positive().max(999999999999.99),
  paymentMethod: requiredText(40),
  paymentDate: optionalDate(),
  reference: optionalText(100),
  notes: optionalLongText()
});

module.exports = { CreateInvoiceSchema, CreatePaymentSchema };
