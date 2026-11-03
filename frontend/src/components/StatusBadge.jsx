// Estados de la base de datos traducidos a una etiqueta con color
const STATUS = {
  quote: ['Cotización', 'bg-slate-100 text-slate-600'],
  confirmed: ['Confirmada', 'bg-sky-50 text-sky-700'],
  delivered: ['Entregada', 'bg-emerald-50 text-emerald-700'],
  draft: ['Borrador', 'bg-slate-100 text-slate-600'],
  ordered: ['Pedida', 'bg-sky-50 text-sky-700'],
  received: ['Recibida', 'bg-emerald-50 text-emerald-700'],
  issued: ['Emitida', 'bg-slate-100 text-slate-600'],
  partial: ['Pago parcial', 'bg-amber-50 text-amber-700'],
  paid: ['Pagada', 'bg-emerald-50 text-emerald-700'],
  cancelled: ['Cancelada', 'bg-red-50 text-red-600'],
  active: ['Activo', 'bg-emerald-50 text-emerald-700'],
  inactive: ['Inactivo', 'bg-slate-100 text-slate-500'],
};

export default function StatusBadge({ status }) {
  const [label, style] = STATUS[status] ?? [status, 'bg-slate-100 text-slate-600'];

  return <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${style}`}>{label}</span>;
}
