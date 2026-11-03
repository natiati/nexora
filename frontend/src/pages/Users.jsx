import { getUser } from '../api/session';
import { rolesApi, usersApi } from '../api/resources';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';
import { useOptions } from '../hooks/useList';
import { dateTime } from '../utils/format';

const columns = [
  { label: 'Nombre', strong: true, render: (u) => `${u.firstName} ${u.lastName}` },
  { label: 'Correo', key: 'email' },
  { label: 'Rol', render: (u) => u.role?.name ?? '—' },
  { label: 'Último ingreso', render: (u) => dateTime(u.lastLoginAt) },
  { label: 'Estado', render: (u) => <StatusBadge status={u.isActive ? 'active' : 'inactive'} /> },
];

export default function Users() {
  const roles = useOptions(rolesApi);
  const currentUserId = getUser().id;

  const fields = [
    { name: 'firstName', label: 'Nombre', required: true, maxLength: 80 },
    { name: 'lastName', label: 'Apellido', required: true, maxLength: 80 },
    { name: 'email', label: 'Correo', type: 'email', required: true, maxLength: 150, createOnly: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: true, maxLength: 72, createOnly: true, help: 'Mínimo 8 caracteres' },
    { name: 'password', label: 'Nueva contraseña', type: 'password', maxLength: 72, editOnly: true, help: 'Déjala vacía para no cambiarla', getValue: () => '' },
    { name: 'phone', label: 'Teléfono', maxLength: 30 },
    { name: 'roleId', label: 'Rol', type: 'select', required: true, options: roles.map((r) => ({ value: r.id, label: r.name })), getValue: (u) => u.role?.id },
    { name: 'avatarUrl', label: 'URL de la foto', type: 'url', maxLength: 500, full: true },
    { name: 'isActive', label: 'Activo (puede iniciar sesión)', type: 'checkbox', editOnly: true },
  ];

  return (
    <CrudPage
      title="Usuarios"
      subtitle="Quién puede entrar a la empresa y con qué rol"
      api={usersApi}
      columns={columns}
      fields={fields}
      createLabel="Nuevo usuario"
      searchPlaceholder="Buscar por nombre o correo"
      canDelete={(user) => user.id !== currentUserId}
    />
  );
}
