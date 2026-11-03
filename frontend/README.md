# Nexora – Frontend

React + Vite + Tailwind. Consume la API del backend (ver README de la raíz).

```bash
cp .env.example .env     # VITE_API_URL = URL del backend
npm install
npm run dev              # abre la landing en http://localhost:5173
```

- `src/pages/Landing.jsx`: página pública, la primera que se ve (`/`). Sus estilos están aislados en `src/styles/landing.css`.
- `src/pages/Login.jsx`: inicio de sesión (`/login`).
- `src/api/client.js`: instancia de axios (agrega el token JWT y cierra sesión en 401).
- `src/api/resources.js`: una función por endpoint; las páginas no escriben URLs.
- `src/api/session.js`: usuario guardado, rol y logout.
- `src/components/Layout.jsx`: menú y protección de rutas (sin sesión va al login).
- `src/components/CrudPage.jsx`: tabla, búsqueda, paginación y formulario de los catálogos.
- `src/components/OrderForm.jsx`: formulario con líneas que comparten Ventas y Compras.
- `src/pages/`: una página por módulo.
