import { rolesApi } from '../api/resources';
import CrudPage from '../components/CrudPage';

const columns = [
  { label: 'Nombre', key: 'name', strong: true },
  { label: 'Identificador', render: (r) => <span className="font-mono text-xs">{r.slug}</span> },
  { label: 'Descripción', key: 'description' },
  { label: 'Usuarios', render: (r) => r._count?.userCompanyRoles ?? 0 },
  { label: 'Tipo', render: (r) => (r.isSystem ? 'Sistema' : 'Personalizado') },
];

const fields = [
  { name: 'name', label: 'Nombre', required: true, maxLength: 80, full: true },
  { name: 'description', label: 'Descripción', type: 'textarea' },
];

export default function Roles() {
  return (
    <CrudPage
      title="Roles"
      subtitle="El rol de sistema Administrador es el único que entra a esta sección"
      api={rolesApi}
      columns={columns}
      fields={fields}
      createLabel="Nuevo rol"
      canDelete={(role) => !role.isSystem}
    />
  );
}
