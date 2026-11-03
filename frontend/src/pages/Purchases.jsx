import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { purchaseOrdersApi, suppliersApi } from '../api/resources';
import ErrorMessage from '../components/ErrorMessage';
import OrderDetail from '../components/OrderDetail';
import OrderForm from '../components/OrderForm';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { useList, useOptions } from '../hooks/useList';
import { date, money } from '../utils/format';

export default function Purchases() {
  const list = useList(purchaseOrdersApi);
  const suppliers = useOptions(suppliersApi);
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
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const create = async ({ partyId, orderDate, limitDate, notes, items }) => {
    await purchaseOrdersApi.create({
      supplierId: partyId,
      orderDate,
      expectedDate: limitDate,
      notes,
      items: items.map(({ productId, quantity, unitAmount, taxRate }) => ({
        productId, quantity, unitCost: unitAmount, taxRate,
      })),
    });
    setCreating(false);
    setNotice('Orden de compra creada. Márcala como recibida cuando llegue la mercancía.');
    list.reload();
  };

  const cancel = (order) => {
    if (window.confirm(`¿Cancelar la orden ${order.orderNumber}?`)) {
      run(() => purchaseOrdersApi.action(order.id, 'cancel'), `Orden ${order.orderNumber} cancelada.`);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <PageHeader title="Compras" subtitle="Al recibir una orden, la mercancía entra al almacén predeterminado">
        <button className="ui-btn" onClick={() => setCreating(true)}>+ Nueva orden de compra</button>
      </PageHeader>

      <ErrorMessage message={error || list.error} />
      {notice && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">{notice}</div>}

      <div className="ui-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr><th>Número</th><th>Proveedor</th><th>Fecha</th><th>Llegada esperada</th><th>Total</th><th>Estado</th><th className="text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {list.rows.map((order) => {
                const open = order.status === 'ordered' || order.status === 'draft';

                return (
                  <tr key={order.id}>
                    <td className="font-mono text-xs !text-slate-800">{order.orderNumber}</td>
                    <td>{order.supplier?.name ?? '—'}</td>
                    <td className="whitespace-nowrap">{date(order.orderDate)}</td>
                    <td className="whitespace-nowrap">{date(order.expectedDate)}</td>
                    <td className="!text-slate-800">{money(order.total)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="whitespace-nowrap text-right space-x-3">
                      <button className="ui-link" onClick={() => setViewing(order)}>Ver</button>
                      {open && (
                        <button className="ui-link" disabled={busy} onClick={() => run(() => purchaseOrdersApi.action(order.id, 'receive'), `Orden ${order.orderNumber} recibida: stock actualizado.`)}>Recibir</button>
                      )}
                      {open && <button className="ui-link-danger" disabled={busy} onClick={() => cancel(order)}>Cancelar</button>}
                    </td>
                  </tr>
                );
              })}
              {list.rows.length === 0 && (
                <tr><td colSpan={7} className="!text-slate-400 text-center !py-8">{list.loading ? 'Cargando…' : 'Todavía no hay órdenes de compra.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onChange={list.setPage} />
      </div>

      {creating && (
        <OrderForm
          kind="purchase"
          partyLabel="Proveedor"
          parties={suppliers}
          dateField="expected-date"
          dateLabel="Llegada esperada"
          onSubmit={create}
          onClose={() => setCreating(false)}
        />
      )}
      {viewing && <OrderDetail order={viewing} partyName={viewing.supplier?.name ?? '—'} isSale={false} onClose={() => setViewing(null)} />}
    </div>
  );
}
