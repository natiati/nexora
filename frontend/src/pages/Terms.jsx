import PublicPage from '../components/PublicPage';
import { CONTACT_EMAIL } from '../utils/contact';

export default function Terms() {
  return (
    <PublicPage title="Términos de uso">
      <p>Nexora es un proyecto académico. Al usarlo aceptas estas condiciones.</p>
      <h2>Uso del servicio</h2>
      <ul>
        <li>Es una plataforma de demostración: no la uses como único registro de información crítica de tu negocio.</li>
        <li>Cuida tu contraseña; las acciones hechas con tu usuario quedan a tu nombre.</li>
        <li>No intentes acceder a datos de otras empresas ni afectar el funcionamiento del servicio.</li>
      </ul>
      <h2>Sin garantías</h2>
      <p>
        El servicio se ofrece tal como está, sin garantía de disponibilidad. Las facturas que genera son
        documentos internos y no reemplazan la facturación electrónica exigida por la ley.
      </p>
      <h2>Contacto</h2>
      <p>Si tienes dudas, escribe a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </PublicPage>
  );
}
