import { demoRequestsApi } from '../api/resources';
import CrudPage from '../components/CrudPage';
import { dateTime } from '../utils/format';

const columns = [
  { label: 'Fecha', render: (r) => dateTime(r.interactionDate) },
  { label: 'Contacto', key: 'subject', strong: true },
  { label: 'Empresa', render: (r) => r.customer?.name ?? '—' },
  { label: 'Correo', render: (r) => r.customer?.email ?? '—' },
];

// Solo lectura: cada solicitud de la landing crea un cliente; se le da seguimiento en Clientes → Historial
export default function DemoRequests() {
  return (
    <CrudPage
      title="Solicitudes de demo"
      subtitle="Llegan desde la landing. Cada prospecto queda en Clientes, con su historial."
      api={demoRequestsApi}
      columns={columns}
      fields={[]}
      canCreate={false}
      canEdit={false}
      canDelete={false}
    />
  );
}
