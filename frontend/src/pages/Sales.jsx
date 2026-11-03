import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { customersApi, invoicesApi, salesOrdersApi } from '../api/resources';
import ErrorMessage from '../components/ErrorMessage';
import OrderDetail from '../components/OrderDetail';
import OrderForm from '../components/OrderForm';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { useList, useOptions } from '../hooks/useList';
import { date, money } from '../utils/format';

export default function Sales() {
  const list = useList(salesOrdersApi);
  const customers = useOptions(customersApi);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (action, message) => {
    setError('');
    setNotice('');
    setBusy(true);

    try {
      await action();
      setNotice(message);
      list.reload();
    } catch (err) {
      // Ej. 409 "Stock insuficiente": la orden no cambia de estado
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const create = async ({ partyId, orderDate, limitDate, notes, items }) => {
    await salesOrdersApi.create({
      customerId: partyId,
      orderDate,
      validUntil: limitDate,
      notes,
      items: items.map(({ productId, quantity, unitAmount, taxRate, discountRate }) => ({
        productId, quantity, unitPrice: unitAmount, taxRate, discountRate,
      })),
    });
    setCreating(false);
    setNotice('Cotización creada. Confírmala para reservar el stock.');
    list.reload();
  };

  const cancel = (order) => {
    if (window.confirm(`¿Cancelar la orden ${order.orderNumber}?`)) {
      run(() => salesOrdersApi.action(order.id, 'cancel'), `Orden ${order.orderNumber} cancelada.`);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <PageHeader title="Ventas" subtitle="Cotización → confirmada (reserva stock) → entregada (descuenta stock)">
        <button className="ui-btn" onClick={() => setCreating(true)}>+ Nueva cotización</button>
      </PageHeader>

      <ErrorMessage message={error || list.error} />
      {notice && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">{notice}</div>}

      <div className="ui-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr><th>Número</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th className="text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {list.rows.map((order) => {
                const invoiced = order.invoices.length > 0;
                const canInvoice = (order.status === 'confirmed' || order.status === 'delivered') && !invoiced;

                return (
                  <tr key={order.id}>
                    <td className="font-mono text-xs !text-slate-800">{order.orderNumber}</td>
                    <td>{order.customer?.name ?? '—'}</td>
                    <td className="whitespace-nowrap">{date(order.orderDate)}</td>
                    <td className="!text-slate-800">{money(order.total)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                      {invoiced && <span className="text-xs text-slate-400 ml-2">Facturada</span>}
                    </td>
                    <td className="whitespace-nowrap text-right space-x-3">
                      <button className="ui-link" onClick={() => setViewing(order)}>Ver</button>
                      {order.status === 'quote' && (
                        <button className="ui-link" disabled={busy} onClick={() => run(() => salesOrdersApi.action(order.id, 'confirm'), `Orden ${order.orderNumber} confirmada: stock reservado.`)}>Confirmar</button>
                      )}
                      {order.status === 'confirmed' && (
                        <button className="ui-link" disabled={busy} onClick={() => run(() => salesOrdersApi.action(order.id, 'deliver'), `Orden ${order.orderNumber} entregada: stock descontado.`)}>Entregar</button>
                      )}
                      {canInvoice && (
                        <button className="ui-link" disabled={busy} onClick={() => run(() => invoicesApi.create({ salesOrderId: order.id }), `Factura creada para ${order.orderNumber}. Regístrale los pagos en Facturas.`)}>Facturar</button>
                      )}
                      {(order.status === 'quote' || (order.status === 'confirmed' && !invoiced)) && (
                        <button className="ui-link-danger" disabled={busy} onClick={() => cancel(order)}>Cancelar</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {list.rows.length === 0 && (
                <tr><td colSpan={6} className="!text-slate-400 text-center !py-8">{list.loading ? 'Cargando…' : 'Todavía no hay órdenes de venta.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onChange={list.setPage} />
      </div>

      {creating && (
        <OrderForm
          kind="sale"
          partyLabel="Cliente"
          parties={customers}
          dateField="valid-until"
          dateLabel="Válida hasta"
          onSubmit={create}
          onClose={() => setCreating(false)}
        />
      )}
      {viewing && <OrderDetail order={viewing} partyName={viewing.customer?.name ?? '—'} isSale onClose={() => setViewing(null)} />}
    </div>
  );
}
