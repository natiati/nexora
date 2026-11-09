const AppError = require('../utils/app-error');
const { generateDocumentNumber } = require('../utils/document-number');
const { calculateLine, sumLines } = require('../utils/order-totals');
const CustomerModel = require('../models/customer.model');
const InvoiceModel = require('../models/invoice.model');
const ProductModel = require('../models/product.model');
const SalesOrderItemModel = require('../models/sales-order-item.model');
const SalesOrderModel = require('../models/sales-order.model');
const ProductService = require('./product.service');
const StockService = require('./stock.service');

// Ciclo de vida: quote → confirmed (reserva stock) → delivered (descuenta stock)
//                quote | confirmed → cancelled (libera la reserva)
class SalesOrderService {
  // sales_orders no tiene company_id: la empresa se alcanza por el cliente
  static scope(companyId) {
    return { customer: { companyId } };
  }

  // POST /sales-orders (estado inicial: "quote")
  static async create(companyId, { customerId, orderNumber, orderDate, validUntil, notes, items, userId }) {
    const customer = await CustomerModel.findOne({ id: customerId, companyId, deletedAt: null, isActive: true });
    if (!customer) throw new AppError('Cliente no encontrado o inactivo', 404);

    await ProductService.assertUsable(companyId, items.map((item) => item.productId));

    const number = orderNumber || generateDocumentNumber('SO');
    if (await SalesOrderModel.findOne({ orderNumber: number, ...this.scope(companyId) })) {
      throw new AppError('Ya existe una orden de venta con ese número', 409);
    }

    const lines = items.map((item) => ({
      item,
      ...calculateLine({
        quantity: item.quantity,
        unitAmount: item.unitPrice,
        taxRate: item.taxRate,
        discountRate: item.discountRate
      })
    }));

    return SalesOrderModel.create(
      {
        customerId,
        orderNumber: number,
        orderDate: orderDate ?? new Date(),
        validUntil,
        notes,
        status: 'quote',
        ...sumLines(lines),
        createdBy: userId,
        items: {
          create: lines.map(({ item, subtotal, total }) => ({ ...item, subtotal, total }))
        }
      },
      { include: { items: true } }
    );
  }

  // GET /sales-orders/:id
  static async getById(companyId, orderId) {
    const order = await SalesOrderModel.findOne(
      { id: orderId, ...this.scope(companyId) },
      { include: { customer: true, items: true, invoices: { where: { status: { not: 'cancelled' } } } } }
    );
    if (!order) throw new AppError('Orden de venta no encontrada', 404);

    const productMap = await ProductModel.findMapByIds([...new Set(order.items.map((item) => item.productId))]);
    return {
      ...order,
      items: order.items.map((item) => ({ ...item, product: productMap.get(item.productId) ?? null }))
    };
  }

  // GET /sales-orders
  static async list(companyId, { skip, take }) {
    const where = this.scope(companyId);
    const [orders, total] = await Promise.all([
      SalesOrderModel.findAll(where, {
        include: { customer: true, items: true, invoices: { where: { status: { not: 'cancelled' } } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      SalesOrderModel.count(where)
    ]);

    // sales_order_items no tiene relación con products: se unen aquí
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
    const order = await SalesOrderModel.findOne(
      { id: orderId, ...this.scope(companyId) },
      { include: { items: true, customer: true } },
      tx
    );
    if (!order) throw new AppError('Orden de venta no encontrada', 404);
    return order;
  }

  // Cambia de estado de forma atómica: evita procesar la misma orden dos veces a la vez
  static async claim(tx, orderId, fromStatus, toStatus) {
    const claimed = await SalesOrderModel.updateMany({ id: orderId, status: fromStatus }, { status: toStatus }, tx);
    if (claimed.count === 0) throw new AppError('La orden ya fue procesada', 409);
  }

  // Líneas que mueven inventario (los productos con trackStock = false no lo hacen)
  static async stockLines(tx, order) {
    const products = await ProductModel.findAll(
      { id: { in: order.items.map((item) => item.productId) } },
      {},
      tx
    );
    const tracked = new Set(products.filter((product) => product.trackStock).map((product) => product.id));
    return order.items.filter((item) => tracked.has(item.productId));
  }

  // El cliente no puede deber más que su cupo de crédito
  static async assertCreditLimit(tx, order) {
    if (order.customer.creditLimit === null) return;

    const invoices = await InvoiceModel.findAll(
      { salesOrder: { customerId: order.customerId }, status: { not: 'cancelled' } },
      {},
      tx
    );
    const owed = invoices.reduce((sum, invoice) => sum + Number(invoice.total) - Number(invoice.paidAmount), 0);

    if (owed + Number(order.total) > Number(order.customer.creditLimit)) {
      throw new AppError('La orden supera el cupo de crédito del cliente', 409);
    }
  }

  // POST /sales-orders/:id/confirm (reserva el stock)
  static async confirm(companyId, orderId) {
    return SalesOrderModel.transaction(async (tx) => {
      const order = await this.getOwned(tx, companyId, orderId);

      if (order.status !== 'quote') throw new AppError('Solo se pueden confirmar cotizaciones', 409);

      if (order.validUntil && order.validUntil.toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10)) {
        throw new AppError('La cotización está vencida', 409);
      }

      await this.assertCreditLimit(tx, order);
      const warehouse = await StockService.getDefaultWarehouse(tx, companyId);
      await this.claim(tx, orderId, 'quote', 'confirmed');

      for (const item of await this.stockLines(tx, order)) {
        await StockService.reserve(tx, {
          productId: item.productId,
          warehouseId: warehouse.id,
          quantity: item.quantity
        });
      }

      return SalesOrderModel.findById(orderId, { include: { items: true } }, tx);
    });
  }

  // POST /sales-orders/:id/deliver (descuenta el stock reservado)
  static async deliver(companyId, orderId, userId) {
    return SalesOrderModel.transaction(async (tx) => {
      const order = await this.getOwned(tx, companyId, orderId);

      if (order.status !== 'confirmed') throw new AppError('Solo se pueden entregar órdenes confirmadas', 409);

      const warehouse = await StockService.getDefaultWarehouse(tx, companyId);
      await this.claim(tx, orderId, 'confirmed', 'delivered');

      for (const item of await this.stockLines(tx, order)) {
        await StockService.consumeReservation(tx, {
          productId: item.productId,
          warehouseId: warehouse.id,
          quantity: item.quantity
        });

        await StockService.recordMovement(tx, {
          productId: item.productId,
          warehouseId: warehouse.id,
          type: 'sale_out',
          quantity: item.quantity.negated(),
          referenceType: 'sales_order',
          referenceId: order.id,
          userId
        });
      }

      for (const item of order.items) {
        await SalesOrderItemModel.update(item.id, { deliveredQuantity: item.quantity }, {}, tx);
      }

      return SalesOrderModel.findById(orderId, { include: { items: true } }, tx);
    });
  }

  // POST /sales-orders/:id/cancel (libera la reserva si la había)
  static async cancel(companyId, orderId) {
    return SalesOrderModel.transaction(async (tx) => {
      const order = await this.getOwned(tx, companyId, orderId);

      if (order.status !== 'quote' && order.status !== 'confirmed') {
        throw new AppError('Esta orden ya no se puede cancelar', 409);
      }

      const invoiced = await InvoiceModel.count({ salesOrderId: orderId, status: { not: 'cancelled' } }, tx);
      if (invoiced > 0) throw new AppError('La orden tiene una factura activa: anúlala primero', 409);

      await this.claim(tx, orderId, order.status, 'cancelled');

      if (order.status === 'confirmed') {
        const warehouse = await StockService.getDefaultWarehouse(tx, companyId);

        for (const item of await this.stockLines(tx, order)) {
          await StockService.release(tx, {
            productId: item.productId,
            warehouseId: warehouse.id,
            quantity: item.quantity
          });
        }
      }

      return SalesOrderModel.findById(orderId, { include: { items: true } }, tx);
    });
  }
}

module.exports = SalesOrderService;
