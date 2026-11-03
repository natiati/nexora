import { categoriesApi } from '../api/resources';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';

const columns = [
  { label: 'Nombre', key: 'name', strong: true },
  { label: 'Identificador', render: (c) => <span className="font-mono text-xs">{c.slug}</span> },
  { label: 'Descripción', key: 'description' },
  { label: 'Estado', render: (c) => <StatusBadge status={c.isActive ? 'active' : 'inactive'} /> },
];

const fields = [
  { name: 'name', label: 'Nombre', required: true, maxLength: 120, full: true },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'isActive', label: 'Activa', type: 'checkbox', editOnly: true },
];

export default function Categories() {
  return (
    <CrudPage
      title="Categorías"
      subtitle="Agrupan los productos de la empresa"
      api={categoriesApi}
      columns={columns}
      fields={fields}
      createLabel="Nueva categoría"
      searchPlaceholder="Buscar categoría"
    />
  );
}
