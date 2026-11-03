import { isAdmin } from '../api/session';
import { warehousesApi } from '../api/resources';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';

const columns = [
  { label: 'Nombre', key: 'name', strong: true },
  { label: 'Código', key: 'code' },
  { label: 'Dirección', key: 'address' },
  { label: 'Predeterminado', render: (w) => (w.isDefault ? 'Sí' : 'No') },
  { label: 'Estado', render: (w) => <StatusBadge status={w.isActive ? 'active' : 'inactive'} /> },
];

const fields = [
  { name: 'name', label: 'Nombre', required: true, maxLength: 120 },
  { name: 'code', label: 'Código', maxLength: 20 },
  { name: 'address', label: 'Dirección', type: 'textarea' },
  { name: 'isDefault', label: 'Predeterminado (aquí entran y salen las órdenes)', type: 'checkbox', full: true },
  { name: 'isActive', label: 'Activo', type: 'checkbox', editOnly: true },
];

export default function Warehouses() {
  return (
    <CrudPage
      title="Almacenes"
      subtitle="Lugares donde se guarda la mercancía"
      api={warehousesApi}
      columns={columns}
      fields={fields}
      createLabel="Nuevo almacén"
      searchPlaceholder="Buscar por nombre o código"
      canCreate={isAdmin()}
      canEdit={isAdmin()}
      canDelete={false}
    />
  );
}
