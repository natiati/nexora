// Pruebas de integración de la API contra una base de datos real.
// Uso: define TEST_DATABASE_URL (ver .env.example), aplica las migraciones y ejecuta `npm test`.
// Nunca usa DATABASE_URL: así no se ensucian los datos de trabajo.
require('dotenv').config({ quiet: true });

if (!process.env.TEST_DATABASE_URL) {
  console.error('Falta TEST_DATABASE_URL: las pruebas necesitan una base de datos aparte.');
  process.exit(1);
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

// Las pruebas nunca usan el correo configurado en .env: solo el servidor SMTP local que levantan ellas
for (const name of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'MAIL_NOTIFY_TO']) {
  delete process.env[name];
}
process.env.JWT_SECRET ??= 'clave-solo-para-pruebas';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');
const { Prisma } = require('@prisma/client');

const app = require('../src/app');
const prisma = require('../src/lib/prisma');

let server;
let baseUrl;
let tokenA;
let tokenB;
let tokenSeller;
let a;
let b;

async function request(method, path, { token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null, headers: response.headers };
}

const get = (path, token) => request('GET', path, { token });
const post = (path, token, body) => request('POST', path, { token, body });
const put = (path, token, body) => request('PUT', path, { token, body });

// Crea una empresa completa y aislada, con nombres únicos para poder repetir las pruebas
async function createCompany(label) {
  const suffix = randomUUID().slice(0, 8);
  const passwordHash = await bcrypt.hash('clave-de-prueba', 4);
  const company = await prisma.company.create({ data: { name: `${label} ${suffix}` } });
  const adminRole = await prisma.role.create({
    data: { companyId: company.id, name: 'Administrador', slug: 'admin', isSystem: true }
  });
  const sellerRole = await prisma.role.create({
    data: { companyId: company.id, name: 'Vendedor', slug: 'vendedor' }
  });
  const admin = await prisma.user.create({
    data: {
      email: `admin-${suffix}@test.local`,
      passwordHash,
      firstName: 'Admin',
      lastName: label,
      companyRoles: { create: { roleId: adminRole.id, isDefault: true } }
    }
  });
  const seller = await prisma.user.create({
    data: {
      email: `vendedor-${suffix}@test.local`,
      passwordHash,
      firstName: 'Vendedor',
      lastName: label,
      companyRoles: { create: { roleId: sellerRole.id, isDefault: true } }
    }
  });
  const category = await prisma.category.create({
    data: { companyId: company.id, name: 'General', slug: 'general' }
  });
  const unit = await prisma.unit.create({ data: { name: `Unidad ${suffix}`, abbreviation: suffix } });
  const warehouse = await prisma.warehouse.create({
    data: { companyId: company.id, name: 'Principal', isDefault: true }
  });
  const product = await prisma.product.create({
    data: { categoryId: category.id, unitId: unit.id, sku: 'P-1', name: 'Producto', costPrice: 100, salePrice: 200, minStock: 2 }
  });
  const customer = await prisma.customer.create({ data: { companyId: company.id, name: 'Cliente' } });
  const supplier = await prisma.supplier.create({ data: { companyId: company.id, name: 'Proveedor' } });

  return { company, adminRole, sellerRole, admin, seller, category, unit, warehouse, product, customer, supplier };
}

// Sesión directa, sin pasar por el límite de intentos de POST /login
async function signSession(user) {
  const { passwordHash } = await prisma.user.findUnique({ where: { id: user.id } });
  const pv = require('node:crypto').createHash('sha256').update(passwordHash).digest('hex').slice(0, 16);
  return require('jsonwebtoken').sign({ userId: user.id, email: user.email, pv }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function login(email) {
  const { status, body } = await post('/login', undefined, { email, password: 'clave-de-prueba' });
  assert.equal(status, 200);
  return body.token;
}

// Compra y recibe mercancía para tener stock disponible
async function stockUp(company, token, quantity) {
  const order = await post('/purchase-orders', token, {
    supplierId: company.supplier.id,
    items: [{ productId: company.product.id, quantity, unitCost: 100 }]
  });
  assert.equal(order.status, 201);
  assert.equal((await post(`/purchase-orders/${order.body.id}/receive`, token)).status, 200);
}

async function currentStock(company, token) {
  const { body } = await get('/stock', token);
  const level = body.find((row) => row.productId === company.product.id);
  return { quantity: Number(level?.quantity ?? 0), reserved: Number(level?.reservedQuantity ?? 0) };
}

const newOrder = (company, quantity, extra = {}) => ({
  customerId: company.customer.id,
  items: [{ productId: company.product.id, quantity, unitPrice: 200 }],
  ...extra
});

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  a = await createCompany('Empresa A');
  b = await createCompany('Empresa B');
  process.env.LEADS_COMPANY_ID = a.company.id;
  tokenA = await login(a.admin.email);
  tokenB = await login(b.admin.email);
  tokenSeller = await login(a.seller.email);
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
});

test('cada modelo declara exactamente las columnas del schema (19 tablas)', () => {
  const models = Prisma.dmmf.datamodel.models;
  assert.equal(models.length, 19);

  const fileName = (name) => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  for (const model of models) {
    const Model = require(`../src/models/${fileName(model.name)}.model`);
    const expected = model.fields.filter((f) => f.kind !== 'object').map((f) => f.name).sort();
    const declared = Model.columns.map((c) => c.property).sort();
    assert.deepEqual(declared, expected, `columnas de ${model.name}`);
    assert.equal(Model.tableName, model.dbName, `tabla de ${model.name}`);
  }
});

test('login: credenciales incorrectas y rutas sin token responden 401', async () => {
  const wrong = await post('/login', undefined, { email: a.admin.email, password: 'incorrecta' });
  assert.equal(wrong.status, 401);
  assert.equal((await get('/products')).status, 401);
  assert.equal((await get('/products', 'token-falso')).status, 401);
});

test('JSON mal formado y rutas inexistentes no generan 500', async () => {
  const response = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{mal'
  });
  assert.equal(response.status, 400);
  assert.equal((await get('/no-existe', tokenA)).status, 404);
});

test('aislamiento entre empresas: no se ven ni se usan datos ajenos', async () => {
  const products = await get('/products', tokenB);
  assert.ok(products.body.every((p) => p.id !== a.product.id));

  assert.equal((await get(`/products/${a.product.id}`, tokenB)).status, 404);
  assert.equal((await put(`/customers/${a.customer.id}`, tokenB, { name: 'Hackeado' })).status, 404);
  assert.equal((await post('/products', tokenB, {
    categoryId: a.category.id, unitId: a.unit.id, sku: 'X', name: 'X', costPrice: 1, salePrice: 1
  })).status, 404);

  // Orden con cliente o producto de otra empresa
  assert.equal((await post('/sales-orders', tokenB, newOrder(a, 1))).status, 404);
  assert.equal((await post('/sales-orders', tokenB, {
    customerId: b.customer.id,
    items: [{ productId: a.product.id, quantity: 1, unitPrice: 1 }]
  })).status, 404);

  // companyId enviado por el cliente se ignora
  const created = await post('/customers', tokenB, { name: 'Propio', companyId: a.company.id });
  assert.equal(created.status, 201);
  assert.equal(created.body.companyId, b.company.id);

  const order = await post('/sales-orders', tokenA, newOrder(a, 1));
  assert.equal((await post(`/sales-orders/${order.body.id}/confirm`, tokenB)).status, 404);
  assert.equal((await post('/invoices', tokenB, { salesOrderId: order.body.id })).status, 404);
  assert.equal((await post(`/sales-orders/${order.body.id}/cancel`, tokenA)).status, 200);
});

test('roles: un vendedor no puede administrar la empresa', async () => {
  assert.equal((await get('/users', tokenSeller)).status, 403);
  assert.equal((await get('/roles', tokenSeller)).status, 403);
  assert.equal((await put('/company', tokenSeller, { name: 'Otro' })).status, 403);
  assert.equal((await post('/warehouses', tokenSeller, { name: 'Otra' })).status, 403);
  assert.equal((await get('/products', tokenSeller)).status, 200);
  assert.equal((await get('/company', tokenSeller)).status, 200);
});

test('usuarios: nunca devuelve la contraseña y desactivar corta la sesión al instante', async () => {
  const email = `nuevo-${randomUUID().slice(0, 8)}@test.local`;
  const created = await post('/users', tokenA, {
    email, password: 'clave-de-prueba', firstName: 'Nuevo', lastName: 'Usuario', roleId: a.sellerRole.id
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.passwordHash, undefined);
  assert.equal(created.body.role.slug, 'vendedor');

  const token = await login(email);
  assert.equal((await get('/products', token)).status, 200);

  // El formulario envía la contraseña vacía como null: no debe cambiarla
  assert.equal((await put(`/users/${created.body.id}`, tokenA, { phone: '300', password: null })).status, 200);
  await login(email);

  assert.equal((await put(`/users/${created.body.id}`, tokenA, { isActive: false })).status, 200);
  assert.equal((await get('/products', token)).status, 401);

  assert.equal((await put(`/users/${a.admin.id}`, tokenA, { isActive: false })).status, 409);
  assert.equal((await post('/users', tokenA, {
    email: `otro-${randomUUID().slice(0, 8)}@test.local`, password: 'clave-de-prueba', firstName: 'A', lastName: 'B', roleId: b.adminRole.id
  })).status, 404);
});

test('catálogos: SKU y código repetidos responden 409; el borrado es lógico', async () => {
  const sku = await post('/products', tokenA, {
    categoryId: a.category.id, unitId: a.unit.id, sku: 'P-1', name: 'Repetido', costPrice: 1, salePrice: 1
  });
  assert.equal(sku.status, 409);

  const product = await post('/products', tokenA, {
    categoryId: a.category.id, unitId: a.unit.id, sku: `T-${randomUUID().slice(0, 6)}`, name: 'Temporal', costPrice: 1, salePrice: 1
  });
  assert.equal(product.status, 201);
  assert.equal((await request('DELETE', `/products/${product.body.id}`, { token: tokenA })).status, 204);
  assert.equal((await get(`/products/${product.body.id}`, tokenA)).status, 404);

  const row = await prisma.product.findUnique({ where: { id: product.body.id } });
  assert.ok(row.deletedAt, 'el producto sigue en la base con deleted_at');

  // No se elimina una categoría con productos
  assert.equal((await request('DELETE', `/categories/${a.category.id}`, { token: tokenA })).status, 409);

  // Almacén predeterminado único
  const second = await post('/warehouses', tokenA, { name: 'Secundario', isDefault: true });
  assert.equal(second.status, 201);
  const warehouses = (await get('/warehouses', tokenA)).body;
  assert.equal(warehouses.filter((w) => w.isDefault).length, 1);
  assert.equal((await put(`/warehouses/${a.warehouse.id}`, tokenA, { isDefault: true })).status, 200);
});

test('flujo completo: compra → venta con reserva → entrega → factura → pagos', async () => {
  const before = await currentStock(a, tokenA);
  await stockUp(a, tokenA, 10);
  assert.equal((await currentStock(a, tokenA)).quantity, before.quantity + 10);

  // Totales calculados en el servidor con descuento e IVA: 3 × 200 = 600, -10 % = 540, +19 % = 642.60
  const order = await post('/sales-orders', tokenA, {
    customerId: a.customer.id,
    items: [{ productId: a.product.id, quantity: 3, unitPrice: 200, taxRate: 19, discountRate: 10 }]
  });
  assert.equal(order.status, 201);
  assert.equal(order.body.status, 'quote');
  assert.equal(Number(order.body.subtotal), 600);
  assert.equal(Number(order.body.discountAmount), 60);
  assert.equal(Number(order.body.taxAmount), 102.6);
  assert.equal(Number(order.body.total), 642.6);

  // Una cotización no se factura ni se entrega
  assert.equal((await post('/invoices', tokenA, { salesOrderId: order.body.id })).status, 409);
  assert.equal((await post(`/sales-orders/${order.body.id}/deliver`, tokenA)).status, 409);

  // Confirmar reserva, pero no descuenta
  assert.equal((await post(`/sales-orders/${order.body.id}/confirm`, tokenA)).status, 200);
  let stock = await currentStock(a, tokenA);
  assert.equal(stock.quantity, before.quantity + 10);
  assert.equal(stock.reserved, before.reserved + 3);
  assert.equal((await post(`/sales-orders/${order.body.id}/confirm`, tokenA)).status, 409);

  // Entregar descuenta y deja la cantidad entregada
  const delivered = await post(`/sales-orders/${order.body.id}/deliver`, tokenA);
  assert.equal(delivered.status, 200);
  assert.equal(delivered.body.status, 'delivered');
  assert.equal(Number(delivered.body.items[0].deliveredQuantity), 3);
  stock = await currentStock(a, tokenA);
  assert.equal(stock.quantity, before.quantity + 7);
  assert.equal(stock.reserved, before.reserved);

  const movements = await get('/stock/movements', tokenA);
  const out = movements.body.find((m) => m.referenceId === order.body.id);
  assert.equal(out.type, 'sale_out');
  assert.equal(Number(out.quantity), -3);

  // Factura única por orden
  const invoice = await post('/invoices', tokenA, { salesOrderId: order.body.id });
  assert.equal(invoice.status, 201);
  assert.equal(Number(invoice.body.total), 642.6);
  assert.equal((await post('/invoices', tokenA, { salesOrderId: order.body.id })).status, 409);
  assert.equal((await post(`/sales-orders/${order.body.id}/cancel`, tokenA)).status, 409);

  // Pagos: parcial, exceso rechazado y saldo completo
  const payment = { paymentMethod: 'cash' };
  const partial = await post(`/invoices/${invoice.body.id}/payments`, tokenA, { ...payment, amount: 142.6 });
  assert.equal(partial.body.status, 'partial');
  assert.equal((await post(`/invoices/${invoice.body.id}/payments`, tokenA, { ...payment, amount: 501 })).status, 409);
  assert.equal((await post(`/invoices/${invoice.body.id}/cancel`, tokenA)).status, 409);
  const paid = await post(`/invoices/${invoice.body.id}/payments`, tokenA, { ...payment, amount: 500 });
  assert.equal(paid.body.status, 'paid');
  assert.equal(Number(paid.body.paidAmount), 642.6);
});

test('stock: la reserva protege lo apartado y nada queda negativo', async () => {
  const start = await currentStock(b, tokenB);
  assert.equal(start.quantity, 0);
  await stockUp(b, tokenB, 5);

  // Sin stock suficiente: 409 y la orden sigue como cotización
  const tooMuch = await post('/sales-orders', tokenB, newOrder(b, 6));
  assert.equal((await post(`/sales-orders/${tooMuch.body.id}/confirm`, tokenB)).status, 409);
  const quote = (await get('/sales-orders', tokenB)).body.find((o) => o.id === tooMuch.body.id);
  assert.equal(quote.status, 'quote');

  const first = await post('/sales-orders', tokenB, newOrder(b, 4));
  assert.equal((await post(`/sales-orders/${first.body.id}/confirm`, tokenB)).status, 200);

  // Solo queda 1 disponible: ni otra orden ni un ajuste pueden tomar lo reservado
  const second = await post('/sales-orders', tokenB, newOrder(b, 2));
  assert.equal((await post(`/sales-orders/${second.body.id}/confirm`, tokenB)).status, 409);
  assert.equal((await post('/stock/adjust', tokenB, {
    productId: b.product.id, warehouseId: b.warehouse.id, quantity: -2
  })).status, 409);

  // Dos confirmaciones simultáneas de una unidad cada una: solo cabe una
  const race1 = await post('/sales-orders', tokenB, newOrder(b, 1));
  const race2 = await post('/sales-orders', tokenB, newOrder(b, 1));
  const statuses = (await Promise.all([
    post(`/sales-orders/${race1.body.id}/confirm`, tokenB),
    post(`/sales-orders/${race2.body.id}/confirm`, tokenB)
  ])).map((r) => r.status).sort();
  assert.deepEqual(statuses, [200, 409]);

  // Cancelar libera la reserva
  assert.equal((await post(`/sales-orders/${first.body.id}/cancel`, tokenB)).status, 200);
  const stock = await currentStock(b, tokenB);
  assert.equal(stock.quantity, 5);
  assert.equal(stock.reserved, 1);

  // Dashboard: calculado solo con datos de la empresa
  const dashboard = await get('/dashboard', tokenB);
  assert.equal(dashboard.status, 200);
  assert.equal(dashboard.body.salesTotal, 0);
});

test('cupo de crédito, vigencia y productos sin control de stock', async () => {
  const limited = await post('/customers', tokenB, { name: 'Con cupo', creditLimit: 100, paymentTerms: '30 días' });
  const service = await post('/products', tokenB, {
    categoryId: b.category.id, unitId: b.unit.id, sku: `S-${randomUUID().slice(0, 6)}`, name: 'Servicio', costPrice: 0, salePrice: 50, trackStock: false
  });
  const items = (quantity) => [{ productId: service.body.id, quantity, unitPrice: 50 }];

  const over = await post('/sales-orders', tokenB, { customerId: limited.body.id, items: items(3) });
  assert.equal((await post(`/sales-orders/${over.body.id}/confirm`, tokenB)).status, 409);

  const expired = await post('/sales-orders', tokenB, {
    customerId: limited.body.id, items: items(1), validUntil: '2020-01-01'
  });
  assert.equal((await post(`/sales-orders/${expired.body.id}/confirm`, tokenB)).status, 409);

  // Un servicio se confirma y entrega sin stock ni movimientos
  const fine = await post('/sales-orders', tokenB, { customerId: limited.body.id, items: items(2) });
  assert.equal((await post(`/sales-orders/${fine.body.id}/confirm`, tokenB)).status, 200);
  assert.equal((await post(`/sales-orders/${fine.body.id}/deliver`, tokenB)).status, 200);
  const movements = await get('/stock/movements', tokenB);
  assert.ok(movements.body.every((m) => m.referenceId !== fine.body.id));

  // Las condiciones de pago definen el vencimiento de la factura
  const invoice = await post('/invoices', tokenB, { salesOrderId: fine.body.id });
  assert.ok(invoice.body.dueDate);
});

test('CRM: las interacciones quedan en el historial del cliente', async () => {
  const created = await post(`/customers/${a.customer.id}/interactions`, tokenSeller, {
    type: 'call', subject: 'Seguimiento', content: 'Llamada de prueba'
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.userId, a.seller.id);
  assert.equal(created.body.companyId, a.company.id);

  const history = await get(`/customers/${a.customer.id}/interactions`, tokenA);
  assert.equal(history.body.length, 1);
  assert.equal((await get(`/customers/${a.customer.id}/interactions`, tokenB)).status, 404);
});

test('compras: cancelar impide recibir y la paginación informa el total', async () => {
  const order = await post('/purchase-orders', tokenA, {
    supplierId: a.supplier.id,
    items: [{ productId: a.product.id, quantity: 1, unitCost: 100, taxRate: 19 }]
  });
  assert.equal(Number(order.body.total), 119);
  assert.equal((await post(`/purchase-orders/${order.body.id}/cancel`, tokenA)).status, 200);
  assert.equal((await post(`/purchase-orders/${order.body.id}/receive`, tokenA)).status, 409);

  const page = await get('/purchase-orders?limit=1&page=1', tokenA);
  assert.equal(page.body.length, 1);
  assert.ok(Number(page.headers.get('x-total-count')) >= 2);

  const search = await get('/products?q=producto', tokenA);
  assert.equal(search.body.length, 1);
  assert.equal((await get('/products?q=no-hay-nada', tokenA)).body.length, 0);
});

test('solicitud de demo: es pública, entra al CRM y no duplica prospectos', async () => {
  const email = `prospecto-${randomUUID().slice(0, 8)}@test.local`;
  const body = { name: 'Ana Prueba', company: 'Prospecto SAS', email, companyId: b.company.id };

  const created = await post('/demo-requests', undefined, body);
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, { message: 'Solicitud recibida' });
  assert.equal((await post('/demo-requests', undefined, { ...body, email: 'no-es-correo' })).status, 400);
  assert.equal((await post('/demo-requests', undefined, body)).status, 201);

  // Entra a la empresa configurada, nunca a la que indique el visitante
  const customers = await prisma.customer.findMany({ where: { email } });
  assert.equal(customers.length, 1);
  assert.equal(customers[0].companyId, a.company.id);
  assert.equal(customers[0].name, 'Prospecto SAS');

  // Consultarlas exige sesión y solo muestra las de la propia empresa
  assert.equal((await get('/demo-requests')).status, 401);
  const mine = await get('/demo-requests', tokenSeller);
  assert.equal(mine.status, 200);
  assert.equal(mine.body.filter((r) => r.customer.email === email).length, 2);
  assert.equal((await get('/demo-requests', tokenB)).body.length, 0);

  // Y aparecen en el historial del cliente
  const history = await get(`/customers/${customers[0].id}/interactions`, tokenA);
  assert.equal(history.body.length, 2);
  assert.match(history.body[0].subject, /Ana Prueba/);
});

// Servidor SMTP local que guarda lo que recibe, para probar el envío sin salir a internet
async function startMailbox() {
  const { SMTPServer } = require('smtp-server');
  const { simpleParser } = require('mailparser');
  const received = [];
  const smtp = new SMTPServer({
    authOptional: true,
    disabledCommands: ['STARTTLS'],
    onData(stream, session, callback) {
      simpleParser(stream).then((mail) => {
        received.push({ mail, to: session.envelope.rcptTo.map((r) => r.address) });
        callback();
      }, callback);
    }
  });
  await new Promise((resolve) => smtp.listen(0, '127.0.0.1', resolve));
  return { received, port: smtp.server.address().port, close: () => new Promise((resolve) => smtp.close(resolve)) };
}

async function waitFor(condition) {
  for (let i = 0; i < 50 && !condition(); i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

function configureMail(port) {
  Object.assign(process.env, {
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: String(port),
    MAIL_FROM: 'Nexora <no-responder@test.local>',
    MAIL_NOTIFY_TO: 'equipo@test.local'
  });
}

function clearMail() {
  for (const name of ['SMTP_HOST', 'SMTP_PORT', 'MAIL_FROM', 'MAIL_NOTIFY_TO']) delete process.env[name];
}

test('correo: avisa al equipo y confirma al visitante, sin repetir la confirmación', async () => {
  const DemoRequestService = require('../src/services/demo-request.service');
  const mailbox = await startMailbox();
  configureMail(mailbox.port);

  try {
    const email = `correo-${randomUUID().slice(0, 8)}@test.local`;
    const request = { name: 'Ana <b>Prueba</b>', company: 'Empresa\nCon Salto', email };

    await DemoRequestService.create(request);
    await waitFor(() => mailbox.received.length >= 2);
    assert.equal(mailbox.received.length, 2);

    const team = mailbox.received.find((m) => m.to.includes('equipo@test.local'));
    assert.equal(team.mail.subject, 'Nueva solicitud de demo: Empresa Con Salto');
    assert.equal(team.mail.replyTo.value[0].address, email);
    assert.equal(team.mail.from.value[0].address, 'no-responder@test.local');
    assert.match(team.mail.html, /Ana &lt;b&gt;Prueba&lt;\/b&gt;/);

    // El texto de la confirmación es fijo: no repite lo que escribió el visitante
    const visitor = mailbox.received.find((m) => m.to.includes(email));
    assert.ok(visitor);
    assert.doesNotMatch(visitor.mail.text + visitor.mail.html, /Prueba<|Con Salto/);

    // Segunda solicitud del mismo correo: avisa al equipo, pero no vuelve a escribirle al visitante
    await DemoRequestService.create(request);
    await waitFor(() => mailbox.received.length >= 3);
    await new Promise((resolve) => setTimeout(resolve, 300));
    assert.equal(mailbox.received.length, 3);
    assert.equal(mailbox.received.filter((m) => m.to.includes(email)).length, 1);
  } finally {
    clearMail();
    await mailbox.close();
  }
});

test('correo: si el servidor falla, la solicitud igual queda guardada', async () => {
  const DemoRequestService = require('../src/services/demo-request.service');
  const mailbox = await startMailbox();
  const { port } = mailbox;
  await mailbox.close();
  configureMail(port); // Puerto ya cerrado: la conexión falla

  try {
    const email = `caido-${randomUUID().slice(0, 8)}@test.local`;
    const result = await DemoRequestService.create({ name: 'Sin Correo', company: 'Caído SAS', email });
    assert.deepEqual(result, { message: 'Solicitud recibida' });
    assert.equal(await prisma.customer.count({ where: { email } }), 1);
    await new Promise((resolve) => setTimeout(resolve, 500));
  } finally {
    clearMail();
  }
});

test('recuperar contraseña: enlace por correo, de un solo uso, y cierra las sesiones abiertas', async () => {
  const mailbox = await startMailbox();
  configureMail(mailbox.port);

  try {
    const email = `olvido-${randomUUID().slice(0, 8)}@test.local`;
    await post('/users', tokenA, { email, password: 'clave-de-prueba', firstName: 'Olvido', lastName: 'Clave', roleId: a.sellerRole.id });
    const oldSession = await login(email);

    // Correo desconocido: misma respuesta y ningún correo
    const unknown = await post('/password/forgot', undefined, { email: 'nadie@test.local' });
    const known = await post('/password/forgot', undefined, { email });
    assert.equal(unknown.status, 200);
    assert.deepEqual(unknown.body, known.body);

    await waitFor(() => mailbox.received.length >= 1);
    await new Promise((resolve) => setTimeout(resolve, 200));
    assert.equal(mailbox.received.length, 1);
    assert.deepEqual(mailbox.received[0].to, [email]);

    const token = mailbox.received[0].mail.text.match(/restablecer-contrasena#token=(\S+)/)[1];

    // Una sesión normal o un enlace alterado no sirven para cambiarla
    assert.equal((await post('/password/reset', undefined, { token: oldSession, password: 'clave-nueva-123' })).status, 400);
    assert.equal((await post('/password/reset', undefined, { token: `${token}x`, password: 'clave-nueva-123' })).status, 400);
    assert.equal((await post('/password/reset', undefined, { token, password: 'corta' })).status, 400);

    assert.equal((await post('/password/reset', undefined, { token, password: 'clave-nueva-123' })).status, 200);

    // Avisa del cambio, el enlace ya no sirve y la sesión anterior quedó cerrada
    await waitFor(() => mailbox.received.length >= 2);
    assert.match(mailbox.received[1].mail.subject, /contraseña de Nexora cambió/);
    assert.equal((await post('/password/reset', undefined, { token, password: 'otra-clave-456' })).status, 400);
    assert.equal((await get('/products', oldSession)).status, 401);

    assert.equal((await post('/login', undefined, { email, password: 'clave-de-prueba' })).status, 401);
    assert.equal((await post('/login', undefined, { email, password: 'clave-nueva-123' })).status, 200);
  } finally {
    clearMail();
    await mailbox.close();
  }
});

test('reportes: meses, productos, clientes y cartera solo con datos de la empresa', async () => {
  const company = await createCompany('Reportes');
  const token = await signSession(company.admin);

  await stockUp(company, token, 20);

  // Orden entregada y facturada con pago parcial: 5 × 200 = 1000
  const order = await post('/sales-orders', token, newOrder(company, 5));
  await post(`/sales-orders/${order.body.id}/confirm`, token);
  await post(`/sales-orders/${order.body.id}/deliver`, token);
  const invoice = await post('/invoices', token, { salesOrderId: order.body.id, dueDate: '2020-01-01' });
  await post(`/invoices/${invoice.body.id}/payments`, token, { amount: 400, paymentMethod: 'cash' });

  const { status, body } = await get('/dashboard?months=3', token);
  assert.equal(status, 200);
  assert.equal(body.months, 3);
  assert.equal(body.monthly.length, 3);

  const current = body.monthly.at(-1);
  assert.equal(current.invoiced, 1000);
  assert.equal(current.collected, 400);

  assert.equal(body.topProducts.length, 1);
  assert.equal(body.topProducts[0].name, 'Producto');
  assert.equal(body.topProducts[0].quantity, 5);
  assert.equal(body.topProducts[0].total, 1000);

  assert.deepEqual(body.topCustomers.map((c) => [c.name, c.invoiced, c.balance]), [['Cliente', 1000, 600]]);
  assert.equal(body.aging.find((a) => a.id === 'over60').total, 600);
  assert.equal(body.aging.find((a) => a.id === 'current').total, 0);

  // Solo se aceptan los periodos del selector
  assert.equal((await get('/dashboard?months=7', token)).status, 400);
  assert.equal((await get('/dashboard', token)).body.monthly.length, 6);

  // Otra empresa sin ventas no ve nada de esto
  const other = await get('/dashboard?months=3', await signSession(b.admin));
  assert.ok(other.body.topCustomers.every((c) => c.id !== company.customer.id));
});
