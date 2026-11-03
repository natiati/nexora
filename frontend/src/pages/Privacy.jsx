import PublicPage from '../components/PublicPage';
import { CONTACT_EMAIL } from '../utils/contact';

export default function Privacy() {
  return (
    <PublicPage title="Privacidad">
      <p>Esta página explica qué datos usa Nexora y para qué. Nexora es un proyecto académico.</p>
      <h2>Solicitudes de demo</h2>
      <p>
        Si llenas el formulario de la página de inicio, guardamos tu nombre, tu empresa y tu correo para
        responderte. Esos datos solo los ve el equipo que atiende las solicitudes. Te enviamos un correo de
        confirmación por medio del proveedor de correo del servicio; si no fuiste tú, puedes ignorarlo.
      </p>
      <h2>Cuentas de usuario</h2>
      <ul>
        <li>Guardamos nombre, correo, teléfono y rol de cada usuario.</li>
        <li>Las contraseñas se guardan cifradas con bcrypt; nadie puede leerlas.</li>
        <li>La información de cada empresa está aislada de la de las demás.</li>
      </ul>
      <h2>En tu navegador</h2>
      <p>
        Al iniciar sesión guardamos un token temporal, válido por 8 horas, y tus datos básicos de usuario en el
        almacenamiento local del navegador. Se borran al cerrar sesión. No usamos cookies de publicidad ni de
        seguimiento. Las tipografías de la página se cargan desde Google Fonts, que recibe tu dirección IP.
      </p>
      <h2>Tus datos</h2>
      <p>
        Para consultar, corregir o eliminar tus datos, escribe a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </PublicPage>
  );
}
