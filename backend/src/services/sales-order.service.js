const prisma = require('../lib/prisma');
const AppError = require('../utils/app-error');
const ProductModel = require('../models/product.model');
const SalesOrderModel = require('../models/sales-order.model');
const StockService = require('./stock.service');

class SalesOrderService {
  // POST /sales-orders (estado inicial: "quote")
  static async create({ customerId, orderNumber, orderDate, items, userId }) {
    if (!(await ProductModel.existAll(items.map((i) => i.productId)))) {
      throw new AppError('Alguno de los productos no existe', 404);
    }

    let subtotal = 0;

    const itemsData = items.map((item) => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: total,
        total
      };
    });

    return SalesOrderModel.create(
      {
        customerId,
        orderNumber,
        orderDate,
        status: 'quote',
        subtotal,
        total: subtotal,
        createdBy: userId,
        items: { create: itemsData }
      },
      { include: { items: true } }
    );
  }

  // GET /sales-orders
  static async list({ skip, take }) {
    const [orders, total] = await Promise.all([
      SalesOrderModel.findAll(
        {},
        {
          include: { customer: true, items: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }
      ),
      SalesOrderModel.count()
    ]);

    const productIds = [
      ...new Set(orders.flatMap((o) => o.items.map((i) => i.productId)))
    ];

    const products = await ProductModel.findMapByIds(productIds);

    const data = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: products.get(item.productId) ?? null
      }))
    }));

    return { data, total };
  }

  // POST /sales-orders/:id/confirm (descuenta stock)
  static async confirm(orderId, userId) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id: orderId },
        include: { items: true, customer: true }
      });

      if (!order) {
        throw new AppError('Orden de venta no encontrada', 404);
      }

      if (order.status !== 'quote') {
        throw new AppError('La orden ya fue procesada', 409);
      }

      // Almacén: cliente → empresa → almacén predeterminado
      const warehouse = await tx.warehouse.findFirst({
        where: {
          companyId: order.customer.companyId,
          isDefault: true
        }
      });

      if (!warehouse) {
        throw new AppError(
          'La empresa del cliente no tiene un almacén predeterminado configurado',
          409
        );
      }

      // "Reclama" la orden de forma atómica: evita confirmarla dos veces a la vez
      const claimed = await tx.salesOrder.updateMany({
        where: { id: orderId, status: 'quote' },
        data: { status: 'confirmed' }
      });

      if (claimed.count === 0) {
        throw new AppError('La orden ya fue procesada', 409);
      }

      for (const item of order.items) {
        await StockService.decrease(tx, {
          productId: item.productId,
          warehouseId: warehouse.id,
          quantity: item.quantity
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            warehouseId: warehouse.id,
            type: 'sale_out',
            quantity: -Number(item.quantity),
            referenceType: 'sales_order',
            referenceId: order.id,
            createdBy: userId
          }
        });
      }

      return tx.salesOrder.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
    });
  }
}

module.exports = SalesOrderService;