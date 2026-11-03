const { z } = require('zod');
const { optionalText, optionalLongText, optionalDate, id, money, quantity, rate } = require('./common');

const SalesOrderItemSchema = z.object({
  productId: id(),
  quantity: quantity(),
  unitPrice: money(),
  taxRate: rate().optional(),
  discountRate: rate().optional()
});

const CreateSalesOrderSchema = z.object({
  customerId: id(),
  // Si no llegan, el servidor genera el número y usa la fecha de hoy
  orderNumber: optionalText(30),
  orderDate: optionalDate(),
  validUntil: optionalDate(),
  notes: optionalLongText(),
  items: z.array(SalesOrderItemSchema).min(1).max(200)
});

module.exports = { CreateSalesOrderSchema };
