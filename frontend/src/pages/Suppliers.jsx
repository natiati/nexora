import { suppliersApi } from '../api/resources';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';

const columns = [
  { label: 'Nombre', key: 'name', strong: true },
  { label: 'NIT', key: 'taxId' },
  { label: 'Contacto', key: 'contactName' },
  { label: 'Correo', key: 'email' },
  { label: 'Teléfono', key: 'phone' },
  { label: 'Estado', render: (s) => <StatusBadge status={s.isActive ? 'active' : 'inactive'} /> },
];

const fields = [
  { name: 'name', label: 'Nombre', required: true, maxLength: 150, full: true },
  { name: 'taxId', label: 'NIT', maxLength: 30 },
  { name: 'contactName', label: 'Persona de contacto', maxLength: 120 },
  { name: 'email', label: 'Correo', type: 'email', maxLength: 150 },
  { name: 'phone', label: 'Teléfono', maxLength: 30 },
  { name: 'address', label: 'Dirección', type: 'textarea' },
  { name: 'notes', label: 'Notas', type: 'textarea' },
  { name: 'isActive', label: 'Activo', type: 'checkbox', editOnly: true },
];

export default function Suppliers() {
  return (
    <CrudPage
      title="Proveedores"
      subtitle="A quién le compras"
      api={suppliersApi}
      columns={columns}
      fields={fields}
      createLabel="Nuevo proveedor"
      searchPlaceholder="Buscar por nombre, NIT, correo o contacto"
    />
  );
}
