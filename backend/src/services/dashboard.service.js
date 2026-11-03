const InvoiceModel = require('../models/invoice.model');
const PaymentModel = require('../models/payment.model');
const ProductModel = require('../models/product.model');
const PurchaseOrderModel = require('../models/purchase-order.model');
const SalesOrderItemModel = require('../models/sales-order-item.model');
const SalesOrderModel = require('../models/sales-order.model');
const StockLevelModel = require('../models/stock-level.model');

const TOP_LIMIT = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Las columnas DATE llegan a medianoche UTC: los meses se calculan en UTC
const monthKey = (date) => date.toISOString().slice(0, 7);

function lastMonths(months) {
  const now = new Date();
  return Array.from({ length: months }, (_, index) =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - index), 1)));
}

function agingBucket(invoice, today) {
  const days = invoice.dueDate ? Math.floor((today - invoice.dueDate) / MS_PER_DAY) : 0;
  if (days <= 0) return 'current';
  if (days <= 30) return 'days30';
  if (days <= 60) return 'days60';
  return 'over60';
}

class DashboardService {
  // GET /dashboard: se calcula en el servidor para no depender de las páginas que cargue el navegador
  static async summary(companyId, { months = 6 } = {}) {
    const [general, reports] = await Promise.all([
      this.indicators(companyId),
      this.reports(companyId, months)
    ]);
    return { ...general, ...reports };
  }

  static async indicators(companyId) {
    const [invoices, pendingOrders, openPurchases, products, stock] = await Promise.all([
      InvoiceModel.totals({ salesOrder: { customer: { companyId } }, status: { not: 'cancelled' } }),
      SalesOrderModel.count({ customer: { companyId }, status: 'quote' }),
      PurchaseOrderModel.count({ supplier: { companyId }, status: 'ordered' }),
      ProductModel.findTrackedByCompany(companyId),
      StockLevelModel.sumByProduct(companyId)
    ]);

    const lowStock = products
      .map((product) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        unit: product.unit.abbreviation,
        minStock: Number(product.minStock),
        quantity: stock.get(product.id) ?? 0
      }))
      .filter((product) => product.quantity <= product.minStock)
      .sort((a, b) => a.quantity - a.minStock - (b.quantity - b.minStock));

    return {
      salesTotal: invoices.total,
      receivable: invoices.total - invoices.paid,
      pendingOrders,
      openPurchases,
      lowStockCount: lowStock.length,
      lowStock: lowStock.slice(0, 8)
    };
  }

  static async reports(companyId, months) {
    const buckets = lastMonths(months);
    const start = buckets[0];
    const activeInvoices = { salesOrder: { customer: { companyId } }, status: { not: 'cancelled' } };

    const [invoices, payments, topItems, openInvoices] = await Promise.all([
      InvoiceModel.findAll(
        { ...activeInvoices, issueDate: { gte: start } },
        { include: { salesOrder: { include: { customer: true } } } }
      ),
      PaymentModel.findAll({ paymentDate: { gte: start }, invoice: activeInvoices }),
      SalesOrderItemModel.sumByProduct({
        customer: { companyId },
        status: { in: ['confirmed', 'delivered'] },
        orderDate: { gte: start }
      }, TOP_LIMIT),
      InvoiceModel.findAll({ salesOrder: { customer: { companyId } }, status: { in: ['issued', 'partial'] } })
    ]);

    return {
      months,
      monthly: this.monthlyReport(buckets, invoices, payments),
      topProducts: await this.topProductsReport(topItems),
      topCustomers: this.topCustomersReport(invoices),
      aging: this.agingReport(openInvoices)
    };
  }

  // Facturado y cobrado de cada mes; los meses sin movimiento también aparecen, en cero
  static monthlyReport(buckets, invoices, payments) {
    const rows = new Map(buckets.map((date) => [monthKey(date), { month: monthKey(date), invoiced: 0, collected: 0 }]));

    for (const invoice of invoices) {
      const row = rows.get(monthKey(invoice.issueDate));
      if (row) row.invoiced += Number(invoice.total);
    }

    for (const payment of payments) {
      const row = rows.get(monthKey(payment.paymentDate));
      if (row) row.collected += Number(payment.amount);
    }

    return [...rows.values()];
  }

  // sales_order_items no tiene relación con products: se unen aquí
  static async topProductsReport(items) {
    const products = await ProductModel.findMapByIds(items.map((item) => item.productId));

    return items.map((item) => ({
      id: item.productId,
      name: products.get(item.productId)?.name ?? 'Producto eliminado',
      quantity: Number(item._sum.quantity ?? 0),
      total: Number(item._sum.total ?? 0)
    }));
  }

  static topCustomersReport(invoices) {
    const customers = new Map();

    for (const invoice of invoices) {
      const { customer } = invoice.salesOrder;
      const row = customers.get(customer.id) ?? { id: customer.id, name: customer.name, invoices: 0, invoiced: 0, balance: 0 };
      row.invoices += 1;
      row.invoiced += Number(invoice.total);
      row.balance += Number(invoice.total) - Number(invoice.paidAmount);
      customers.set(customer.id, row);
    }

    return [...customers.values()].sort((a, b) => b.invoiced - a.invoiced).slice(0, TOP_LIMIT);
  }

  // Cuánto se debe y qué tan vencido está
  static agingReport(openInvoices) {
    const today = new Date(new Date().toISOString().slice(0, 10));
    const amounts = { current: 0, days30: 0, days60: 0, over60: 0 };

    for (const invoice of openInvoices) {
      amounts[agingBucket(invoice, today)] += Number(invoice.total) - Number(invoice.paidAmount);
    }

    return [
      { id: 'current', name: 'Sin vencer', total: amounts.current },
      { id: 'days30', name: '1 a 30 días', total: amounts.days30 },
      { id: 'days60', name: '31 a 60 días', total: amounts.days60 },
      { id: 'over60', name: 'Más de 60 días', total: amounts.over60 }
    ];
  }
}

module.exports = DashboardService;
