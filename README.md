# Nexora

Plataforma de gestión de inventario, ventas y CRM.


- **Backend:** Node.js + Express 5 + Prisma 7 + PostgreSQL
- **Frontend:** React 19 + Vite + Tailwind

Al ejecutar la aplicación se abre primero la **landing page**; el botón **Iniciar sesión** lleva a `/login` y de ahí al panel.

## Puesta en marcha

Requisitos: Node 20+ y PostgreSQL. Crea una base de datos vacía llamada `nexora` y luego:

```bash
# 1) Variables de entorno: copia los ejemplos y completa DATABASE_URL y JWT_SECRET
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2) Instala todo, crea las 19 tablas y carga los datos de demostración
npm run setup

# 3) Levanta backend y frontend; el navegador se abre en la landing
npm run dev
```

| Servicio | URL |
|---|---|
| Landing y aplicación | http://localhost:5173 |
| API | http://localhost:3000 |
| Documentación de la API (Swagger) | http://localhost:3000/docs |

Si tu base ya existía, aplica las migraciones nuevas con `npx prisma migrate deploy` (dentro de `backend/`).

| Usuario de prueba | Clave | Rol |
|---|---|---|
| `admin@nexora.com` | `123456` | Administrador: acceso completo |
| `vendedor@nexora.com` | `123456` | Vendedor: operación, sin la sección de administración |

Para volver a los datos de demostración **(borra todo el contenido de la base)**: `npm run db:reset --prefix backend`.

## Arquitectura

Arquitectura limpia por capas con patrón MVC. Las dependencias solo apuntan hacia adentro: cada capa conoce a la siguiente, nunca a la anterior.

```
Petición HTTP
   │
   ▼
routes/       URL + método HTTP + permisos. Único lugar que toca Express (req/res):  ┐
              saca los datos de la petición y se los pasa al controlador.          │
controllers/  Controlador (MVC): recibe los datos, los valida con el DTO,          │ Entrada
              llama al service y devuelve el código HTTP (200, 201, 204).          │
dtos/         DTO de entrada: validan con Zod los datos que entran                 ┘
   │
   ▼
services/     Reglas de negocio y transacciones                              Negocio
   │
   ▼
models/       Modelo y repositorio: una clase por tabla; únicos que usan Prisma    Datos
   │
   ▼
PostgreSQL

React (frontend/src/pages) es la Vista (MVC): solo habla con la API por medio de src/api.
```

```
backend/
├── server.js          Punto de entrada: valida el entorno y arranca el servidor
├── middleware/        auth.js (JWT y roles) · error-handler.js (errores centralizados)
├── prisma/            schema.prisma (19 tablas) · migrations · seed.js
├── tests/             Pruebas de integración de la API
└── src/
    ├── app.js         Configura Express (helmet, CORS, Swagger, rutas, errores)
    ├── docs/          swagger.js (especificación OpenAPI que se ve en /docs)
    ├── routes/        *.routes.js · index.js (monta todas las rutas) · http-adapter.js (envía la respuesta)
    ├── controllers/   *.controller.js · crud.controller.js (CRUD genérico)
    ├── dtos/          *.dto.js
    ├── services/      *.service.js
    ├── models/        *.model.js (19) sobre BaseModel
    ├── lib/prisma.js  Cliente único de Prisma
    ├── lib/mailer.js  Único punto que envía correos (SMTP)
    └── utils/         AppError · respuestas HTTP (ok, created…) · paginación · totales · números de documento

frontend/src/
├── api/               client.js (axios + JWT) · resources.js (una función por endpoint) · session.js
├── components/        Layout · CrudPage · OrderForm · Modal · …
├── hooks/             useList · useOptions
├── pages/             Una página por módulo; Landing.jsx es la entrada pública
└── utils/             Formato de dinero, cantidades y fechas
```

## Cobertura del schema (19 tablas)

| Tabla | Modelo | API | Pantalla |
|---|---|---|---|
| `companies` | Company | `GET/PUT /company` | Empresa |
| `users` | User | `/users` (CRUD, borrado lógico) | Usuarios |
| `roles` | Role | `/roles` (CRUD) | Roles |
| `user_company_roles` | UserCompanyRole | Se gestiona desde `/users` | Usuarios (campo Rol) |
| `categories` | Category | `/categories` (CRUD, borrado lógico) | Categorías |
| `units` | Unit | `GET/POST /units` | Unidades |
| `products` | Product | `/products` (CRUD, borrado lógico, búsqueda) | Productos |
| `suppliers` | Supplier | `/suppliers` (CRUD, borrado lógico) | Proveedores |
| `customers` | Customer | `/customers` (CRUD, borrado lógico) | Clientes |
| `customer_interactions` | CustomerInteraction | `GET/POST /customers/:id/interactions`, `/demo-requests` | Clientes → Historial · Solicitudes de demo |
| `warehouses` | Warehouse | `/warehouses` | Almacenes |
| `stock_levels` | StockLevel | `GET /stock`, `POST /stock/adjust` | Existencias → Saldos |
| `stock_movements` | StockMovement | `GET /stock/movements` | Existencias → Movimientos |
| `purchase_orders` | PurchaseOrder | `/purchase-orders`, `/:id/receive`, `/:id/cancel` | Compras |
| `purchase_order_items` | PurchaseOrderItem | Dentro de la orden de compra | Compras |
| `sales_orders` | SalesOrder | `/sales-orders`, `/:id/confirm`, `/:id/deliver`, `/:id/cancel` | Ventas |
| `sales_order_items` | SalesOrderItem | Dentro de la orden de venta | Ventas |
| `invoices` | Invoice | `/invoices`, `/:id/cancel` | Facturas |
| `payments` | Payment | `POST /invoices/:id/payments` | Facturas → Pagar |

**Decisiones por la forma del schema**

- **Aislamiento entre empresas.** Solo algunas tablas tienen `company_id`; en las demás la empresa se alcanza por sus relaciones: `Product → Category`, `SalesOrder → Customer`, `PurchaseOrder → Supplier`, `Invoice → SalesOrder → Customer`, `StockLevel → Warehouse`. Los services filtran así todas las consultas, y `companyId` siempre sale del usuario autenticado, nunca de la petición.
- **`product_id` sin llave foránea.** En `stock_levels`, `stock_movements` y las líneas de orden el schema no define la relación con `products`, así que los services validan el producto y unen los datos.
- **Unicidad por empresa.** El schema no define índices únicos para SKU, números de documento ni códigos, de modo que los services validan los duplicados.
- **Unidades compartidas.** `units` no tiene `company_id`: todas las empresas las ven y por eso no se editan ni eliminan.
- **Solicitudes de demo sin tabla nueva.** El formulario público de la landing (`POST /demo-requests`) crea el prospecto en `customers` y la solicitud en `customer_interactions`, con tipo `demo_request`. Entran a la empresa de `LEADS_COMPANY_ID` o, si no está definida, a la primera creada.
- **Facturas siempre con orden.** `sales_order_id` es opcional en el schema, pero una factura sin orden no tendría empresa, por lo que la API la exige.

## Reglas de negocio

- **Ventas:** cotización → confirmada (reserva stock) → entregada (descuenta stock y registra el movimiento). Cancelar libera la reserva. No se confirma si no hay disponible (`cantidad - reservado`), si la cotización venció o si se supera el cupo de crédito del cliente.
- **Compras:** pedida → recibida (suma stock y registra el movimiento) o cancelada.
- **Facturas:** emitida → pago parcial → pagada. Una factura activa por orden; un pago no puede superar el saldo; solo se anula si no tiene pagos. El vencimiento sale de las condiciones de pago del cliente ("30 días").
- **Totales:** los calcula el servidor con `Decimal`, incluidos descuento e IVA de cada línea.
- **Productos sin control de inventario** (`track_stock = false`, por ejemplo servicios): se venden sin mover stock.

## Seguridad

- Contraseñas con bcrypt y JWT de 8 horas firmado con `JWT_SECRET`.
- Límite de 10 intentos de inicio de sesión por IP cada 15 minutos; el mismo mensaje de error para usuario o clave incorrectos.
- El formulario público de demo admite 5 solicitudes por IP cada hora y responde igual aunque el correo ya exista.
- El estado del usuario se consulta en cada petición: desactivarlo corta su sesión de inmediato.
- Autorización por rol en el servidor (`requireRole`): usuarios, roles, y cambios de empresa, almacenes y unidades son solo para administradores.
- Validación de todas las entradas con Zod, cabeceras con Helmet y CORS restringido por `CORS_ORIGIN`.
- Bloqueos y `UPDATE` condicionales para que operaciones simultáneas no dejen stock negativo ni pagos de más.

## Pruebas

Las pruebas usan una base de datos propia y nunca `DATABASE_URL`. Crea una base vacía `nexora_test`, define `TEST_DATABASE_URL` en `backend/.env` y aplica las migraciones sobre ella:

```bash
cd backend
DATABASE_URL="postgresql://postgres:TU_CLAVE@localhost:5432/nexora_test" npx prisma migrate deploy
npm test
```

Cubren aislamiento entre empresas, roles, flujo completo de compra a pago, concurrencia de stock, reglas de crédito y coincidencia de los 19 modelos con `schema.prisma`.

## Prueba rápida del flujo completo

1. Abrir http://localhost:5173 (landing) → **Solicitar demo** y enviar el formulario; luego **Iniciar sesión** con `admin@nexora.com` y verla en **Solicitudes de demo**.
2. **Compras:** crear una orden y pulsar *Recibir* → sube el stock en **Existencias**.
3. **Ventas:** crear una cotización y pulsar *Confirmar* → el stock queda reservado. Si pides más de lo disponible, aparece "Stock insuficiente".
4. *Entregar* → baja el stock y aparece el movimiento. *Facturar* crea la factura.
5. **Facturas:** *Pagar*. Un pago mayor al saldo se rechaza.
6. **Dashboard:** los indicadores y las gráficas se actualizan; cambia el periodo o exporta a CSV.

## Correo

El sistema envía correos en dos casos: las solicitudes de demo (aviso al equipo y confirmación al visitante) y la recuperación de contraseña (enlace y aviso de cambio). Se envían por SMTP con Nodemailer, así que sirve cualquier proveedor. Sin configurarlo la aplicación funciona igual, pero no salen correos.

Para el correo, `backend/.env` tiene prioridad sobre las variables globales del sistema, porque otros programas pueden definir `SMTP_HOST` o `SMTP_PASS`.

**Con Gmail:**

1. Activa la verificación en dos pasos en tu cuenta de Google.
2. Crea una contraseña de aplicación en https://myaccount.google.com/apppasswords.
3. Descomenta y completa estas variables en `backend/.env`:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-correo@gmail.com"
SMTP_PASS="la-contraseña-de-aplicación"
```

4. Comprueba que funciona; envía un correo de prueba a tu cuenta:

```bash
npm run mail:test --prefix backend
```

**Decisiones de diseño**

- `lib/mailer.js` es el único que habla con SMTP y `services/email.service.js` arma los mensajes, así que cambiar de proveedor no toca las reglas de negocio.
- El envío ocurre después de guardar y sin esperar: si el correo falla, la solicitud no se pierde y el error queda en el registro del servidor.
- La confirmación tiene texto fijo y se envía máximo una vez al día por dirección, para que el formulario público no sirva para escribirle a terceros.

## Recuperar contraseña

En el login, **¿La olvidaste?** pide el correo y envía un enlace válido por 1 hora.

- **Sin tabla nueva:** el enlace es un JWT firmado con `JWT_SECRET` más la contraseña actual. Al cambiarla, la firma deja de coincidir, así que sirve una sola vez.
- **No revela cuentas:** la respuesta y el tiempo son iguales aunque el correo no exista.
- **Cierra sesiones:** cada JWT de sesión lleva una huella de la contraseña; al cambiarla, las sesiones abiertas dejan de valer.
- Los usuarios de demostración usan correos inventados que no reciben mensajes. Para probarlo, crea en **Usuarios** uno con tu correo real.

## Reportes del dashboard

`GET /dashboard?months=3|6|12` calcula todo en el servidor, solo con datos de la empresa del usuario:

| Reporte | Forma | Exportar |
|---|---|---|
| Facturado y cobrado por mes | Columnas agrupadas | CSV |
| Cartera por antigüedad | Barras | |
| Productos más vendidos | Barras | |
| Mejores clientes | Tabla | CSV |

Las gráficas son componentes propios en HTML (`components/charts`), sin librerías, y cada una tiene su vista de tabla.

## Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `DATABASE_URL` | backend | Cadena de conexión de PostgreSQL |
| `TEST_DATABASE_URL` | backend | Base de datos exclusiva para `npm test` |
| `JWT_SECRET` | backend | Clave para firmar los JWT (larga y aleatoria) |
| `CORS_ORIGIN` | backend | URL(s) del frontend permitidas, separadas por coma |
| `PORT` | backend | Puerto (por defecto 3000) |
| `LEADS_COMPANY_ID` | backend | Opcional: empresa que recibe las solicitudes de demo |
| `SMTP_HOST`, `SMTP_PORT` | backend | Servidor de correo (587 por defecto) |
| `SMTP_USER`, `SMTP_PASS` | backend | Credenciales del servidor de correo |
| `MAIL_FROM` | backend | Remitente (por defecto, `SMTP_USER`) |
| `MAIL_NOTIFY_TO` | backend | Quién recibe los avisos de demo (por defecto, `SMTP_USER`) |
| `FRONTEND_URL` | backend | URL del frontend para los enlaces de los correos (por defecto, el primer `CORS_ORIGIN`) |
| `VITE_API_URL` | frontend | URL pública del backend |
| `VITE_CONTACT_EMAIL` | frontend | Correo de contacto de la landing y las páginas informativas |

## Despliegue (resumen)

- **Base de datos:** Neon (PostgreSQL). Usar su cadena de conexión como `DATABASE_URL`.
- **Backend:** Render. *Build:* `npm install && npx prisma generate && npx prisma migrate deploy` · *Start:* `npm start`. Definir `DATABASE_URL`, `JWT_SECRET` y `CORS_ORIGIN` (URL del frontend).
- **Frontend:** Vercel o Cloudflare Pages. *Build:* `npm run build` · *Output:* `dist` · definir `VITE_API_URL` (URL del backend). Agregar una regla para que todas las rutas sirvan `index.html` (las páginas usan React Router).
