import PublicPage from '../components/PublicPage';
import { CONTACT_EMAIL } from '../utils/contact';

export default function About() {
  return (
    <PublicPage title="Nosotros">
      <p>
        Nexora es una plataforma para llevar productos, inventario, ventas, compras, facturación y clientes
        en un solo lugar, sin hojas de cálculo con veinte columnas.
      </p>
      <p>
        Nació como proyecto final de las materias Diseño de Software y Desarrollo Web de la CUN. Por eso,
        además de resolver la operación diaria, se construyó con una arquitectura limpia por capas y el
        patrón MVC, una interfaz web pensada para trabajar sin instrucciones y una base de datos que
        mantiene separada la información de cada empresa.
      </p>
      <h2>Contacto</h2>
      <p>Escríbenos a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </PublicPage>
  );
}
