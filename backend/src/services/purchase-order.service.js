const AppError = require('../utils/app-error');
const { generateDocumentNumber } = require('../utils/document-number');
const { calculateLine, sumLines } = require('../utils/order-totals');
const ProductModel = require('../models/product.model');
const PurchaseOrderItemModel = require('../models/purchase-order-item.model');
const PurchaseOrderModel = require('../models/purchase-order.model');
const SupplierModel = require('../models/supplier.model');
const ProductService = require('./product.service');
const StockService = require('./stock.service');

// Ciclo de vida: ordered → received (entra el stock) | cancelled
class PurchaseOrderService {
  // purchase_orders no tiene company_id: la empresa se alcanza por el proveedor
  static scope(companyId) {
    return { supplier: { companyId } };
  }

  // POST /purchase-orders
  static async create(companyId, { supplierId, orderNumber, orderDate, expectedDate, notes, items, userId }) {
    const supplier = await SupplierModel.findOne({ id: supplierId, companyId, deletedAt: null, isActive: true });
    if (!supplier) throw new AppError('Proveedor no encontrado o inactivo', 404);

    // productId no tiene llave foránea en el schema: se valida aquí que existan
    await ProductService.assertUsable(companyId, items.map((item) => item.productId));

    const number = orderNumber || generateDocumentNumber('PO');
    if (await PurchaseOrderModel.findOne({ orderNumber: number, ...this.scope(companyId) })) {
      throw new AppError('Ya existe una orden de compra con ese número', 409);
    }

    const lines = items.map((item) => ({
      item,
      ...calculateLine({ quantity: item.quantity, unitAmount: item.unitCost, taxRate: item.taxRate })
    }));
    const { subtotal, taxAmount, total } = sumLines(lines);

    return PurchaseOrderModel.create(
      {
        supplierId,
        orderNumber: number,
        orderDate: orderDate ?? new Date(),
        expectedDate,
        notes,
        status: 'ordered',
        subtotal,
        taxAmount,
        total,
        createdBy: userId,
        items: {
          create: lines.map(({ item, subtotal: lineSubtotal, total: lineTotal }) => ({
            ...item,
            subtotal: lineSubtotal,
            total: lineTotal
          }))
        }
      },
      { include: { items: true } }
    );
  }

  // GET /purchase-orders
  static async list(companyId, { skip, take }) {
    const where = this.scope(companyId);
    const [orders, total] = await Promise.all([
      PurchaseOrderModel.findAll(where, {
        include: { supplier: true, items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      PurchaseOrderModel.count(where)
    ]);

    const products = await ProductModel.findMapByIds([
      ...new Set(orders.flatMap((order) => order.items.map((item) => item.productId)))
    ]);

    const data = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({ ...item, product: products.get(item.productId) ?? null }))
    }));

    return { data, total };
  }

  static async getOwned(tx, companyId, orderId) {
    const order = await PurchaseOrderModel.findOne(
      { id: orderId, ...this.scope(companyId) },
      { include: { items: true } },
      tx
    );
    if (!order) throw new AppError('Orden de compra no encontrada', 404);
    return order;
  }

  // POST /purchase-orders/:id/receive
  static async receive(companyId, orderId, userId) {
    return PurchaseOrderModel.transaction(async (tx) => {
      const order = await this.getOwned(tx, companyId, orderId);

      if (order.status === 'received') throw new AppError('La orden ya fue recibida', 409);
      if (order.status === 'cancelled') throw new AppError('La orden está cancelada', 409);

      const warehouse = await StockService.getDefaultWarehouse(tx, companyId);

      // Reclama la orden de forma atómica
      const claimed = await PurchaseOrderModel.updateMany(
        { id: orderId, status: order.status },
        { status: 'received' },
        tx
      );
      if (claimed.count === 0) throw new AppError('La orden ya fue recibida', 409);

      const products = await ProductModel.findAll(
        { id: { in: order.items.map((item) => item.productId) } },
        {},
        tx
      );
      const tracked = new Set(products.filter((product) => product.trackStock).map((product) => product.id));

      for (const item of order.items) {
        if (tracked.has(item.productId)) {
          await StockService.increase(tx, {
            productId: item.productId,
            warehouseId: warehouse.id,
            quantity: item.quantity
          });

          await StockService.recordMovement(tx, {
            productId: item.productId,
            warehouseId: warehouse.id,
            type: 'purchase_in',
            quantity: item.quantity,
            unitCost: item.unitCost,
            referenceType: 'purchase_order',
            referenceId: order.id,
            userId
          });
        }

        await PurchaseOrderItemModel.update(item.id, { receivedQuantity: item.quantity }, {}, tx);
      }

      return PurchaseOrderModel.findById(orderId, { include: { items: true } }, tx);
    });
  }

  // POST /purchase-orders/:id/cancel
  static async cancel(companyId, orderId) {
    const order = await this.getOwned(undefined, companyId, orderId);

    const claimed = await PurchaseOrderModel.updateMany(
      { id: order.id, status: { in: ['draft', 'ordered'] } },
      { status: 'cancelled' }
    );
    if (claimed.count === 0) throw new AppError('Esta orden ya no se puede cancelar', 409);

    return PurchaseOrderModel.findById(orderId, { include: { items: true } });
  }
}

module.exports = PurchaseOrderService;
