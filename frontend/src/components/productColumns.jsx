import { money, quantity } from '../utils/format';
import StatusBadge from './StatusBadge';

// Columnas de la tabla de productos. También las usa la vista previa de la landing.
export const productColumns = [
  { label: 'SKU', render: (p) => <span className="font-mono text-xs">{p.sku}</span> },
  { label: 'Nombre', key: 'name', strong: true },
  { label: 'Categoría', render: (p) => p.category?.name ?? '—' },
  { label: 'Costo', render: (p) => money(p.costPrice) },
  { label: 'Precio', render: (p) => money(p.salePrice) },
  { label: 'Mínimo', render: (p) => (p.trackStock ? `${quantity(p.minStock)} ${p.unit?.abbreviation ?? ''}` : 'No controla stock') },
  { label: 'Estado', render: (p) => <StatusBadge status={p.isActive ? 'active' : 'inactive'} /> },
];
