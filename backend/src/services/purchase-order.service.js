const prisma = require('../lib/prisma');
const AppError = require('../utils/app-error');
const ProductModel = require('../models/product.model');
const PurchaseOrderModel = require('../models/purchase-order.model');
const StockService = require('./stock.service');

class PurchaseOrderService {
  // POST /purchase-orders
  static async create({ supplierId, orderNumber, orderDate, items, userId }) {
    // productId no tiene llave foránea en el schema: se valida aquí que existan
    if (!(await ProductModel.existAll(items.map((i) => i.productId)))) {
      throw new AppError('Alguno de los productos no existe', 404);
    }

    let subtotal = 0;

    const itemsData = items.map((item) => {
      const total = item.quantity * item.unitCost;
      subtotal += total;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        subtotal: total,
        total
      };
    });

    return PurchaseOrderModel.create(
      {
        supplierId,
        orderNumber,
        orderDate,
        status: 'ordered',
        subtotal,
        total: subtotal,
        createdBy: userId,
        items: { create: itemsData }
      },
      { include: { items: true } }
    );
  }

  // GET /purchase-orders
  static async list({ skip, take }) {
    const [orders, total] = await Promise.all([
      PurchaseOrderModel.findAll(
        {},
        {
          include: { supplier: true, items: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }
      ),
      PurchaseOrderModel.count()
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

  // POST /purchase-orders/:id/receive
  static async receive(orderId, userId) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { items: true, supplier: true }
      });

      if (!order) {
        throw new AppError('Orden de compra no encontrada', 404);
      }

      if (order.status === 'received') {
        throw new AppError('La orden ya fue recibida', 409);
      }

      // Almacén: proveedor → empresa → almacén predeterminado
      const warehouse = await tx.warehouse.findFirst({
        where: {
          companyId: order.supplier.companyId,
          isDefault: true
        }
      });

      if (!warehouse) {
        throw new AppError(
          'La empresa del proveedor no tiene un almacén predeterminado configurado',
          409
        );
      }

      // Reclama la orden de forma atómica
      const claimed = await tx.purchaseOrder.updateMany({
        where: {
          id: orderId,
          status: { not: 'received' }
        },
        data: { status: 'received' }
      });

      if (claimed.count === 0) {
        throw new AppError('La orden ya fue recibida', 409);
      }

      for (const item of order.items) {
        await StockService.increase(tx, {
          productId: item.productId,
          warehouseId: warehouse.id,
          quantity: item.quantity
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            warehouseId: warehouse.id,
            type: 'purchase_in',
            quantity: item.quantity,
            unitCost: item.unitCost,
            referenceType: 'purchase_order',
            referenceId: order.id,
            createdBy: userId
          }
        });

        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: { receivedQuantity: item.quantity }
        });
      }

      return tx.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
    });
  }
}

module.exports = PurchaseOrderService;