import { isAdmin } from '../api/session';
import { unitsApi } from '../api/resources';
import CrudPage from '../components/CrudPage';

const columns = [
  { label: 'Nombre', key: 'name', strong: true },
  { label: 'Abreviatura', key: 'abbreviation' },
];

const fields = [
  { name: 'name', label: 'Nombre', required: true, maxLength: 50 },
  { name: 'abbreviation', label: 'Abreviatura', required: true, maxLength: 15 },
];

// Las unidades son compartidas entre empresas: se pueden agregar, pero no editar ni eliminar
export default function Units() {
  return (
    <CrudPage
      title="Unidades"
      subtitle="Compartidas por todas las empresas de la plataforma"
      api={unitsApi}
      columns={columns}
      fields={fields}
      createLabel="Nueva unidad"
      canCreate={isAdmin()}
      canEdit={false}
      canDelete={false}
    />
  );
}
