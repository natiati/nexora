import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { productsApi, stockApi, stockMovementsApi, warehousesApi } from '../api/resources';
import ErrorMessage from '../components/ErrorMessage';
import { FieldGrid } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { useList, useOptions } from '../hooks/useList';
import { dateTime, quantity } from '../utils/format';

const MOVEMENT_LABELS = {
  purchase_in: 'Entrada por compra',
  sale_out: 'Salida por venta',
  adjustment: 'Ajuste manual',
};

const emptyAdjustment = { productId: '', warehouseId: '', quantity: '', notes: '' };

function AdjustModal({ onClose, onDone }) {
  const products = useOptions(productsApi);
  const warehouses = useOptions(warehousesApi);
  const [values, setValues] = useState(emptyAdjustment);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fields = [
    { name: 'productId', label: 'Producto', type: 'select', required: true, full: true, options: products.filter((p) => p.trackStock).map((p) => ({ value: p.id, label: `${p.sku} · ${p.name}` })) },
    { name: 'warehouseId', label: 'Almacén', type: 'select', required: true, options: warehouses.filter((w) => w.isActive).map((w) => ({ value: w.id, label: w.name })) },
    { name: 'quantity', label: 'Cantidad', type: 'number', required: true, min: '-99999999', help: 'Positiva para sumar, negativa para restar' },
    { name: 'notes', label: 'Motivo', type: 'textarea' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await stockApi.adjust({ ...values, quantity: Number(values.quantity) });
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal title="Ajustar inventario" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <FieldGrid fields={fields} values={values} onChange={setValues} />
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" className="ui-btn-outline" onClick={onClose}>Cancelar</button>
          <button className="ui-btn" disabled={saving}>{saving ? 'Guardando…' : 'Registrar ajuste'}</button>
        </div>
      </form>
    </Modal>
  );
}

function LevelsTable({ list }) {
  return (
    <table className="ui-table">
      <thead>
        <tr><th>SKU</th><th>Producto</th><th>Almacén</th><th>Existencias</th><th>Reservado</th><th>Disponible</th></tr>
      </thead>
      <tbody>
        {list.rows.map((s) => {
          const available = Number(s.quantity) - Number(s.reservedQuantity);
          const low = Number(s.quantity) <= Number(s.product?.minStock ?? 0);
          return (
            <tr key={s.id}>
              <td className="font-mono text-xs">{s.product?.sku ?? '—'}</td>
              <td className="!text-slate-800">{s.product?.name ?? '—'}</td>
              <td>{s.warehouse?.name ?? '—'}</td>
              <td>{quantity(s.quantity)}</td>
              <td>{quantity(s.reservedQuantity)}</td>
              <td>
                <span className={`text-xs px-3 py-1 rounded-full ${low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {quantity(available)}
                </span>
              </td>
            </tr>
          );
        })}
        {list.rows.length === 0 && (
          <tr><td colSpan={6} className="!text-slate-400 text-center !py-8">{list.loading ? 'Cargando…' : 'Todavía no hay existencias.'}</td></tr>
        )}
      </tbody>
    </table>
  );
}

function MovementsTable({ list }) {
  return (
    <table className="ui-table">
      <thead>
        <tr><th>Fecha</th><th>Producto</th><th>Almacén</th><th>Tipo</th><th>Cantidad</th><th>Notas</th></tr>
      </thead>
      <tbody>
        {list.rows.map((m) => (
          <tr key={m.id}>
            <td className="whitespace-nowrap">{dateTime(m.createdAt)}</td>
            <td className="!text-slate-800">{m.product?.name ?? '—'}</td>
            <td>{m.warehouse?.name ?? '—'}</td>
            <td>{MOVEMENT_LABELS[m.type] ?? m.type}</td>
            <td className={Number(m.quantity) < 0 ? '!text-red-600' : '!text-emerald-700'}>
              {Number(m.quantity) > 0 ? '+' : ''}{quantity(m.quantity)}
            </td>
            <td>{m.notes ?? '—'}</td>
          </tr>
        ))}
        {list.rows.length === 0 && (
          <tr><td colSpan={6} className="!text-slate-400 text-center !py-8">{list.loading ? 'Cargando…' : 'Todavía no hay movimientos.'}</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default function Stock() {
  const [tab, setTab] = useState('levels');
  const [adjusting, setAdjusting] = useState(false);
  const levels = useList(stockApi);
  const movements = useList(stockMovementsApi);
  const list = tab === 'levels' ? levels : movements;

  const tabClass = (name) =>
    `px-4 py-2 text-sm border-b-2 cursor-pointer ${tab === name ? 'border-teal-700 text-teal-700 font-medium' : 'border-transparent text-slate-500 hover:text-slate-800'}`;

  return (
    <div className="p-4 sm:p-8">
      <PageHeader title="Existencias" subtitle="Cuánto hay, cuánto está apartado y qué se ha movido">
        <button className="ui-btn" onClick={() => setAdjusting(true)}>Ajustar inventario</button>
      </PageHeader>

      <ErrorMessage message={list.error} />

      <div className="flex gap-1 mb-4 border-b border-slate-200">
        <button className={tabClass('levels')} onClick={() => setTab('levels')}>Saldos</button>
        <button className={tabClass('movements')} onClick={() => setTab('movements')}>Movimientos</button>
      </div>

      <div className="ui-card overflow-hidden">
        <div className="overflow-x-auto">
          {tab === 'levels' ? <LevelsTable list={levels} /> : <MovementsTable list={movements} />}
        </div>
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onChange={list.setPage} />
      </div>

      {adjusting && (
        <AdjustModal
          onClose={() => setAdjusting(false)}
          onDone={() => {
            setAdjusting(false);
            levels.reload();
            movements.reload();
          }}
        />
      )}
    </div>
  );
}
