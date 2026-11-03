import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { productsApi } from '../api/resources';
import { useOptions } from '../hooks/useList';
import { money, todayInput } from '../utils/format';
import ErrorMessage from './ErrorMessage';
import Modal from './Modal';

const DEFAULT_TAX = 19;

const emptyLine = () => ({ key: crypto.randomUUID(), productId: '', quantity: 1, unitAmount: '', taxRate: DEFAULT_TAX, discountRate: 0 });

// Mismo cálculo que el servidor, solo para mostrar el total antes de guardar; el servidor recalcula
function lineTotals(line, withDiscount) {
  const subtotal = Number(line.quantity || 0) * Number(line.unitAmount || 0);
  const discount = withDiscount ? (subtotal * Number(line.discountRate || 0)) / 100 : 0;
  const tax = ((subtotal - discount) * Number(line.taxRate || 0)) / 100;
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}

/**
 * Formulario de una orden con sus líneas. Lo comparten ventas y compras:
 * `kind` decide si se usa precio de venta y descuento o costo de compra.
 */
export default function OrderForm({ kind, partyLabel, parties, dateField, dateLabel, onSubmit, onClose }) {
  const isSale = kind === 'sale';
  const products = useOptions(productsApi).filter((p) => p.isActive);
  const [partyId, setPartyId] = useState('');
  const [orderDate, setOrderDate] = useState(todayInput());
  const [limitDate, setLimitDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const updateLine = (key, changes) => setLines(lines.map((line) => (line.key === key ? { ...line, ...changes } : line)));

  // Al elegir un producto se propone su precio; se puede cambiar
  const chooseProduct = (key, productId) => {
    const product = products.find((p) => p.id === productId);
    updateLine(key, {
      productId,
      unitAmount: product ? Number(isSale ? product.salePrice : product.costPrice) : '',
    });
  };

  const totals = lines.map((line) => lineTotals(line, isSale)).reduce(
    (sum, line) => ({
      subtotal: sum.subtotal + line.subtotal,
      discount: sum.discount + line.discount,
      tax: sum.tax + line.tax,
      total: sum.total + line.total,
    }),
    { subtotal: 0, discount: 0, tax: 0, total: 0 }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await onSubmit({
        partyId,
        orderDate,
        limitDate: limitDate || null,
        notes: notes || null,
        items: lines.map(({ productId, quantity, unitAmount, taxRate, discountRate }) => ({
          productId,
          quantity: Number(quantity),
          unitAmount: Number(unitAmount),
          taxRate: Number(taxRate || 0),
          discountRate: Number(discountRate || 0),
        })),
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal title={isSale ? 'Nueva cotización' : 'Nueva orden de compra'} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label htmlFor="order-party" className="ui-label">{partyLabel} *</label>
            <select id="order-party" className="ui-input" required value={partyId} onChange={(e) => setPartyId(e.target.value)}>
              <option value="">Selecciona…</option>
              {parties.filter((p) => p.isActive).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="order-date" className="ui-label">Fecha *</label>
            <input id="order-date" className="ui-input" type="date" required value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor={dateField} className="ui-label">{dateLabel}</label>
            <input id={dateField} className="ui-input" type="date" value={limitDate} onChange={(e) => setLimitDate(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto mb-2">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="pb-1 font-medium">Producto</th>
                <th className="pb-1 font-medium w-20">Cantidad</th>
                <th className="pb-1 font-medium w-28">{isSale ? 'Precio' : 'Costo'}</th>
                {isSale && <th className="pb-1 font-medium w-20">Desc. %</th>}
                <th className="pb-1 font-medium w-20">IVA %</th>
                <th className="pb-1 font-medium w-28 text-right">Total</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.key}>
                  <td className="pr-2 py-1">
                    <select aria-label="Producto" className="ui-input" required value={line.productId} onChange={(e) => chooseProduct(line.key, e.target.value)}>
                      <option value="">Selecciona…</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
                    </select>
                  </td>
                  <td className="pr-2 py-1">
                    <input aria-label="Cantidad" className="ui-input" type="number" min="0.001" step="any" required value={line.quantity} onChange={(e) => updateLine(line.key, { quantity: e.target.value })} />
                  </td>
                  <td className="pr-2 py-1">
                    <input aria-label={isSale ? 'Precio' : 'Costo'} className="ui-input" type="number" min="0" step="any" required value={line.unitAmount} onChange={(e) => updateLine(line.key, { unitAmount: e.target.value })} />
                  </td>
                  {isSale && (
                    <td className="pr-2 py-1">
                      <input aria-label="Descuento" className="ui-input" type="number" min="0" max="100" step="any" value={line.discountRate} onChange={(e) => updateLine(line.key, { discountRate: e.target.value })} />
                    </td>
                  )}
                  <td className="pr-2 py-1">
                    <input aria-label="IVA" className="ui-input" type="number" min="0" max="100" step="any" value={line.taxRate} onChange={(e) => updateLine(line.key, { taxRate: e.target.value })} />
                  </td>
                  <td className="py-1 text-right text-slate-800 whitespace-nowrap">{money(lineTotals(line, isSale).total)}</td>
                  <td className="py-1 text-right">
                    <button type="button" aria-label="Quitar línea" className="text-slate-400 hover:text-red-600 cursor-pointer disabled:opacity-30" disabled={lines.length === 1} onClick={() => setLines(lines.filter((l) => l.key !== line.key))}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" className="ui-link mb-4" onClick={() => setLines([...lines, emptyLine()])}>+ Agregar producto</button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="order-notes" className="ui-label">Notas</label>
            <textarea id="order-notes" className="ui-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <dl className="text-sm space-y-1 self-end">
            <div className="flex justify-between text-slate-500"><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
            {isSale && <div className="flex justify-between text-slate-500"><dt>Descuento</dt><dd>-{money(totals.discount)}</dd></div>}
            <div className="flex justify-between text-slate-500"><dt>IVA</dt><dd>{money(totals.tax)}</dd></div>
            <div className="flex justify-between text-base font-semibold text-slate-900 border-t border-slate-100 pt-1"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
          </dl>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button type="button" className="ui-btn-outline" onClick={onClose}>Cancelar</button>
          <button className="ui-btn" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
}
