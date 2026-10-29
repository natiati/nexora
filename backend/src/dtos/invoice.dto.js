const { z } = require('zod');

const CreateInvoiceSchema = z.object({
  salesOrderId: z.string().uuid(),
  invoiceNumber: z.string().min(1).max(30),
  
});

const CreatePaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentMethod: z.string().min(1).max(40),
  
});

module.exports = { CreateInvoiceSchema, CreatePaymentSchema };