const { z } = require('zod');
const { optionalText, optionalLongText, optionalDate, id, money, quantity, rate } = require('./common');

const PurchaseOrderItemSchema = z.object({
  productId: id(),
  quantity: quantity(),
  unitCost: money(),
  taxRate: rate().optional()
});

const CreatePurchaseOrderSchema = z.object({
  supplierId: id(),
  // Si no llegan, el servidor genera el número y usa la fecha de hoy
  orderNumber: optionalText(30),
  orderDate: optionalDate(),
  expectedDate: optionalDate(),
  notes: optionalLongText(),
  items: z.array(PurchaseOrderItemSchema).min(1).max(200)
});

module.exports = { CreatePurchaseOrderSchema };
