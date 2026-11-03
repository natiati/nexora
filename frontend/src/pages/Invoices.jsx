import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { invoicesApi } from '../api/resources';
import ErrorMessage from '../components/ErrorMessage';
import { FieldGrid } from '../components/FormFields';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { useList } from '../hooks/useList';
import { date, money, todayInput } from '../utils/format';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'check', label: 'Cheque' },
];

const methodLabel = (method) => PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;

const balanceOf = (invoice) => Number(invoice.total) - Number(invoice.paidAmount);

function PaymentModal({ invoice, onClose, onDone }) {
  const open = invoice.status !== 'paid' && invoice.status !== 'cancelled';
  const [values, setValues] = useState({
    amount: balanceOf(invoice),
    paymentMethod: 'transfer',
    paymentDate: todayInput(),
    reference: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fields = [
    { name: 'amount', label: 'Monto', type: 'number', required: true, min: '0.01', help: `Saldo pendiente: ${money(balanceOf(invoice))}` },
    { name: 'paymentMethod', label: 'Método', type: 'select', required: true, options: PAYMENT_METHODS },
    { name: 'paymentDate', label: 'Fecha', type: 'date', required: true },
    { name: 'reference', label: 'Referencia', maxLength: 100 },
    { name: 'notes', label: 'Notas', type: 'textarea' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await invoicesApi.action(invoice.id, 'payments', { ...values, amount: Number(values.amount) });
      onDone();
    } catch (err) {
      // Ej. 409 "El pago supera el saldo pendiente"
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal title={`Factura ${invoice.invoiceNumber}`} onClose={onClose}>
      <ErrorMessage message={error} />

      {open && (
        <form onSubmit={handleSubmit} className="mb-5">
          <FieldGrid fields={fields} values={values} onChange={setValues} />
          <div className="flex justify-end mt-3">
            <button className="ui-btn" disabled={saving}>{saving ? 'Registrando…' : 'Registrar pago'}</button>
          </div>
        </form>
      )}

      <div className="text-sm font-semibold text-slate-900 mb-2">Pagos registrados</div>
      {invoice.payments.length === 0 && <p className="text-sm text-slate-400">Todavía no hay pagos.</p>}
      {invoice.payments.map((payment) => (
        <div key={payment.id} className="flex justify-between gap-3 text-sm py-1.5 border-b border-slate-50 last:border-0">
          <span className="text-slate-600">
            {date(payment.paymentDate)} · {methodLabel(payment.paymentMethod)}
            {payment.reference ? ` · ${payment.reference}` : ''}
          </span>
          <span className="text-slate-800 font-medium">{money(payment.amount)}</span>
        </div>
      ))}
    </Modal>
  );
}

export default function Invoices() {
  const list = useList(invoicesApi);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const cancel = async (invoice) => {
    if (!window.confirm(`¿Anular la factura ${invoice.invoiceNumber}?`)) return;
    setError('');

    try {
      await invoicesApi.action(invoice.id, 'cancel');
      list.reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <PageHeader title="Facturas" subtitle="Se crean desde Ventas, con el botón Facturar de cada orden" />

      <ErrorMessage message={error || list.error} />

      <div className="ui-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr><th>Factura</th><th>Cliente</th><th>Emisión</th><th>Vence</th><th>Total</th><th>Saldo</th><th>Estado</th><th className="text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {list.rows.map((invoice) => {
                const open = invoice.status !== 'paid' && invoice.status !== 'cancelled';

                return (
                  <tr key={invoice.id}>
                    <td className="font-mono text-xs !text-slate-800">{invoice.invoiceNumber}</td>
                    <td>{invoice.customer?.name ?? '—'}</td>
                    <td className="whitespace-nowrap">{date(invoice.issueDate)}</td>
                    <td className="whitespace-nowrap">{date(invoice.dueDate)}</td>
                    <td className="!text-slate-800">{money(invoice.total)}</td>
                    <td>{invoice.status === 'cancelled' ? '—' : money(balanceOf(invoice))}</td>
                    <td><StatusBadge status={invoice.status} /></td>
                    <td className="whitespace-nowrap text-right space-x-3">
                      <button className="ui-link" onClick={() => setSelected(invoice)}>{open ? 'Pagar' : 'Ver pagos'}</button>
                      {open && Number(invoice.paidAmount) === 0 && (
                        <button className="ui-link-danger" onClick={() => cancel(invoice)}>Anular</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {list.rows.length === 0 && (
                <tr><td colSpan={8} className="!text-slate-400 text-center !py-8">{list.loading ? 'Cargando…' : 'Todavía no hay facturas.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onChange={list.setPage} />
      </div>

      {selected && (
        <PaymentModal
          invoice={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            list.reload();
          }}
        />
      )}
    </div>
  );
}
