const { z } = require('zod');

const SalesOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative()
});

const CreateSalesOrderSchema = z.object({
  customerId: z.string().uuid(),
  orderNumber: z.string().min(1).max(30),
  orderDate: z.coerce.date(),
  items: z.array(SalesOrderItemSchema).min(1),
  
});


module.exports = { CreateSalesOrderSchema};