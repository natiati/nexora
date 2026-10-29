const { z } = require('zod');

const PurchaseOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().nonnegative()
});

const CreatePurchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  orderNumber: z.string().min(1).max(30),
  orderDate: z.coerce.date(),
  items: z.array(PurchaseOrderItemSchema).min(1),
  
});



module.exports = { CreatePurchaseOrderSchema };