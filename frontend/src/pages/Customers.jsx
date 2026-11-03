import { useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { customersApi } from '../api/resources';
import CrudPage from '../components/CrudPage';
import ErrorMessage from '../components/ErrorMessage';
import { FieldGrid } from '../components/FormFields';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { dateTime, money } from '../utils/format';

const INTERACTION_TYPES = [
  { value: 'call', label: 'Llamada' },
  { value: 'email', label: 'Correo' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'visit', label: 'Visita' },
  { value: 'note', label: 'Nota' },
];

// demo_request lo crea el formulario de la landing; no se registra a mano
const typeLabel = (type) => (type === 'demo_request' ? 'Solicitud de demo' : INTERACTION_TYPES.find((t) => t.value === type)?.label ?? type);

const columns = [
  { label: 'Código', key: 'code' },
  { label: 'Nombre', key: 'name', strong: true },
  { label: 'NIT', key: 'taxId' },
  { label: 'Correo', key: 'email' },
  { label: 'Ciudad', key: 'city' },
  { label: 'Cupo', render: (c) => (c.creditLimit === null ? 'Sin límite' : money(c.creditLimit)) },
  { label: 'Estado', render: (c) => <StatusBadge status={c.isActive ? 'active' : 'inactive'} /> },
];

const fields = [
  { name: 'name', label: 'Nombre', required: true, maxLength: 150, full: true },
  { name: 'code', label: 'Código', maxLength: 30 },
  { name: 'taxId', label: 'NIT', maxLength: 30 },
  { name: 'email', label: 'Correo', type: 'email', maxLength: 150 },
  { name: 'phone', label: 'Teléfono', maxLength: 30 },
  { name: 'city', label: 'Ciudad', maxLength: 100 },
  { name: 'address', label: 'Dirección', maxLength: 300 },
  { name: 'creditLimit', label: 'Cupo de crédito', type: 'number', help: 'Vacío = sin límite' },
  { name: 'paymentTerms', label: 'Condiciones de pago', maxLength: 50, placeholder: '30 días', help: 'El número de días define el vencimiento de la factura' },
  { name: 'notes', label: 'Notas', type: 'textarea' },
  { name: 'isActive', label: 'Activo', type: 'checkbox', editOnly: true },
];

const interactionFields = [
  { name: 'type', label: 'Tipo', type: 'select', required: true, options: INTERACTION_TYPES },
  { name: 'subject', label: 'Asunto', maxLength: 200 },
  { name: 'content', label: 'Detalle', type: 'textarea', required: true },
];

const emptyInteraction = { type: 'call', subject: '', content: '' };

// Historial de contacto con el cliente (CRM)
function InteractionsModal({ customer, onClose }) {
  const [items, setItems] = useState([]);
  const [values, setValues] = useState(emptyInteraction);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    customersApi.interactions(customer.id).then(setItems).catch((err) => setError(getErrorMessage(err)));
  }, [customer.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const created = await customersApi.addInteraction(customer.id, values);
      setItems([created, ...items]);
      setValues(emptyInteraction);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Historial · ${customer.name}`} onClose={onClose}>
      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="mb-5">
        <FieldGrid fields={interactionFields} values={values} onChange={setValues} />
        <div className="flex justify-end mt-3">
          <button className="ui-btn" disabled={saving}>{saving ? 'Guardando…' : 'Registrar'}</button>
        </div>
      </form>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-400">Todavía no hay interacciones.</p>}
        {items.map((item) => (
          <div key={item.id} className="text-sm">
            <div className="flex justify-between gap-3">
              <span className="font-medium text-slate-800">{typeLabel(item.type)}{item.subject ? ` · ${item.subject}` : ''}</span>
              <span className="text-xs text-slate-400 shrink-0">{dateTime(item.interactionDate)}</span>
            </div>
            <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{item.content}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default function Customers() {
  const [history, setHistory] = useState(null);

  return (
    <>
      <CrudPage
        title="Clientes"
        subtitle="A quién le vendes y qué se ha hablado con cada uno"
        api={customersApi}
        columns={columns}
        fields={fields}
        createLabel="Nuevo cliente"
        searchPlaceholder="Buscar por nombre, código, NIT, correo o ciudad"
        rowActions={(customer) => <button className="ui-link" onClick={() => setHistory(customer)}>Historial</button>}
      />
      {history && <InteractionsModal customer={history} onClose={() => setHistory(null)} />}
    </>
  );
}
