const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nexora API',
      version: '1.0.0',
      description: 'API REST de Nexora — gestión de inventario, ventas y CRM'
    },
    servers: [{ url: 'http://localhost:3000', description: 'Desarrollo local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido en POST /login'
        }
      }
    },
    security: [],
    tags: [
      { name: 'Auth', description: 'Autenticación y contraseñas' },
      { name: 'Dashboard', description: 'Indicadores y reportes' },
      { name: 'Empresa', description: 'Datos de la empresa' },
      { name: 'Usuarios', description: 'Gestión de usuarios (admin)' },
      { name: 'Roles', description: 'Gestión de roles (admin)' },
      { name: 'Categorías', description: 'Categorías de productos' },
      { name: 'Unidades', description: 'Unidades de medida' },
      { name: 'Productos', description: 'Catálogo de productos' },
      { name: 'Proveedores', description: 'Proveedores' },
      { name: 'Clientes', description: 'Clientes y CRM' },
      { name: 'Almacenes', description: 'Almacenes e inventario' },
      { name: 'Stock', description: 'Niveles de stock y movimientos' },
      { name: 'Órdenes de compra', description: 'Compras a proveedores' },
      { name: 'Órdenes de venta', description: 'Ventas a clientes' },
      { name: 'Facturas', description: 'Facturación y pagos' },
      { name: 'Demo', description: 'Solicitudes de demo (pública)' }
    ],
    paths: {
      // ── AUTH ──────────────────────────────────────────────────────────────
      '/login': {
        post: {
          tags: ['Auth'],
          summary: 'Iniciar sesión',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'admin@nexora.com' },
                    password: { type: 'string', example: '123456' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Token JWT y datos del usuario' },
            401: { description: 'Credenciales inválidas' }
          }
        }
      },
      '/password/forgot': {
        post: {
          tags: ['Auth'],
          summary: 'Solicitar restablecimiento de contraseña',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } } }
              }
            }
          },
          responses: { 200: { description: 'Mensaje de confirmación (siempre igual)' } }
        }
      },
      '/password/reset': {
        post: {
          tags: ['Auth'],
          summary: 'Restablecer contraseña con token',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    password: { type: 'string', minLength: 8 }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Contraseña actualizada' }, 400: { description: 'Token inválido o expirado' } }
        }
      },

      // ── DASHBOARD ─────────────────────────────────────────────────────────
      '/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: 'Resumen de indicadores y reportes',
          parameters: [{ in: 'query', name: 'months', schema: { type: 'integer', enum: [3, 6, 12], default: 6 }, description: 'Meses del reporte' }],
          responses: { 200: { description: 'Indicadores, gráficas mensuales, top productos/clientes y aging' } }
        }
      },

      // ── EMPRESA ───────────────────────────────────────────────────────────
      '/company': {
        get: {
          tags: ['Empresa'],
          summary: 'Obtener datos de la empresa',
          responses: { 200: { description: 'Datos de la empresa autenticada' } }
        },
        put: {
          tags: ['Empresa'],
          summary: 'Actualizar datos de la empresa (admin)',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' }, legalName: { type: 'string' },
                    taxId: { type: 'string' }, email: { type: 'string' },
                    phone: { type: 'string' }, address: { type: 'string' },
                    city: { type: 'string' }, country: { type: 'string' },
                    currency: { type: 'string', minLength: 3, maxLength: 3 },
                    timezone: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Empresa actualizada' } }
        }
      },

      // ── USUARIOS ──────────────────────────────────────────────────────────
      '/users': {
        get: { tags: ['Usuarios'], summary: 'Listar usuarios (admin)', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer', default: 1 } }, { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } }, { in: 'query', name: 'q', schema: { type: 'string' }, description: 'Búsqueda por nombre o correo' }], responses: { 200: { description: 'Lista de usuarios' } } },
        post: {
          tags: ['Usuarios'], summary: 'Crear usuario (admin)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object', required: ['email', 'password', 'firstName', 'lastName', 'roleId'],
                  properties: {
                    email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 },
                    firstName: { type: 'string' }, lastName: { type: 'string' },
                    phone: { type: 'string' }, roleId: { type: 'string', format: 'uuid' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Usuario creado' } }
        }
      },
      '/users/{id}': {
        put: { tags: ['Usuarios'], summary: 'Actualizar usuario (admin)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, isActive: { type: 'boolean' }, roleId: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { 200: { description: 'Usuario actualizado' } } },
        delete: { tags: ['Usuarios'], summary: 'Eliminar usuario (admin)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Usuario eliminado' } } }
      },

      // ── ROLES ─────────────────────────────────────────────────────────────
      '/roles': {
        get: { tags: ['Roles'], summary: 'Listar roles (admin)', responses: { 200: { description: 'Lista de roles' } } },
        post: { tags: ['Roles'], summary: 'Crear rol (admin)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' } } } } } }, responses: { 201: { description: 'Rol creado' } } }
      },
      '/roles/{id}': {
        get: { tags: ['Roles'], summary: 'Obtener rol por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Rol' } } },
        put: { tags: ['Roles'], summary: 'Actualizar rol (admin)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } } } } }, responses: { 200: { description: 'Rol actualizado' } } },
        delete: { tags: ['Roles'], summary: 'Eliminar rol (admin)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Rol eliminado' } } }
      },

      // ── CATEGORÍAS ────────────────────────────────────────────────────────
      '/categories': {
        get: { tags: ['Categorías'], summary: 'Listar categorías', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }, { in: 'query', name: 'q', schema: { type: 'string' } }], responses: { 200: { description: 'Lista de categorías' } } },
        post: { tags: ['Categorías'], summary: 'Crear categoría', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' } } } } } }, responses: { 201: { description: 'Categoría creada' } } }
      },
      '/categories/{id}': {
        get: { tags: ['Categorías'], summary: 'Obtener categoría por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Categoría' } } },
        put: { tags: ['Categorías'], summary: 'Actualizar categoría', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, isActive: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Categoría actualizada' } } },
        delete: { tags: ['Categorías'], summary: 'Eliminar categoría', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Categoría eliminada' } } }
      },

      // ── UNIDADES ──────────────────────────────────────────────────────────
      '/units': {
        get: { tags: ['Unidades'], summary: 'Listar unidades de medida', responses: { 200: { description: 'Lista de unidades' } } },
        post: { tags: ['Unidades'], summary: 'Crear unidad (admin)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'abbreviation'], properties: { name: { type: 'string', example: 'Kilogramo' }, abbreviation: { type: 'string', example: 'kg' } } } } } }, responses: { 201: { description: 'Unidad creada' } } }
      },

      // ── PRODUCTOS ─────────────────────────────────────────────────────────
      '/products': {
        get: { tags: ['Productos'], summary: 'Listar productos', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }, { in: 'query', name: 'q', schema: { type: 'string' } }], responses: { 200: { description: 'Lista de productos' } } },
        post: {
          tags: ['Productos'], summary: 'Crear producto',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object', required: ['categoryId', 'unitId', 'sku', 'name', 'costPrice', 'salePrice'],
                  properties: {
                    categoryId: { type: 'string', format: 'uuid' }, unitId: { type: 'string', format: 'uuid' },
                    sku: { type: 'string' }, barcode: { type: 'string' }, name: { type: 'string' },
                    description: { type: 'string' }, costPrice: { type: 'number' }, salePrice: { type: 'number' },
                    minStock: { type: 'number' }, trackStock: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Producto creado' } }
        }
      },
      '/products/{id}': {
        get: { tags: ['Productos'], summary: 'Obtener producto por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Producto' } } },
        put: { tags: ['Productos'], summary: 'Actualizar producto', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, costPrice: { type: 'number' }, salePrice: { type: 'number' }, isActive: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Producto actualizado' } } },
        delete: { tags: ['Productos'], summary: 'Eliminar producto', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Producto eliminado' } } }
      },

      // ── PROVEEDORES ───────────────────────────────────────────────────────
      '/suppliers': {
        get: { tags: ['Proveedores'], summary: 'Listar proveedores', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'q', schema: { type: 'string' } }], responses: { 200: { description: 'Lista de proveedores' } } },
        post: { tags: ['Proveedores'], summary: 'Crear proveedor', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, taxId: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' }, contactName: { type: 'string' } } } } } }, responses: { 201: { description: 'Proveedor creado' } } }
      },
      '/suppliers/{id}': {
        get: { tags: ['Proveedores'], summary: 'Obtener proveedor por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Proveedor' } } },
        put: { tags: ['Proveedores'], summary: 'Actualizar proveedor', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, isActive: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Proveedor actualizado' } } },
        delete: { tags: ['Proveedores'], summary: 'Eliminar proveedor', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Proveedor eliminado' } } }
      },

      // ── CLIENTES ──────────────────────────────────────────────────────────
      '/customers': {
        get: { tags: ['Clientes'], summary: 'Listar clientes', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'q', schema: { type: 'string' } }], responses: { 200: { description: 'Lista de clientes' } } },
        post: { tags: ['Clientes'], summary: 'Crear cliente', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, code: { type: 'string' }, taxId: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, creditLimit: { type: 'number' }, paymentTerms: { type: 'string', example: '30' } } } } } }, responses: { 201: { description: 'Cliente creado' } } }
      },
      '/customers/{id}': {
        get: { tags: ['Clientes'], summary: 'Obtener cliente por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Cliente' } } },
        put: { tags: ['Clientes'], summary: 'Actualizar cliente', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, isActive: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Cliente actualizado' } } },
        delete: { tags: ['Clientes'], summary: 'Eliminar cliente', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Cliente eliminado' } } }
      },
      '/customers/{id}/interactions': {
        get: { tags: ['Clientes'], summary: 'Historial de interacciones del cliente', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Lista de interacciones' } } },
        post: { tags: ['Clientes'], summary: 'Registrar interacción con el cliente', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['type', 'content'], properties: { type: { type: 'string', enum: ['call', 'email', 'meeting', 'visit', 'note'] }, subject: { type: 'string' }, content: { type: 'string' }, interactionDate: { type: 'string', format: 'date' } } } } } }, responses: { 201: { description: 'Interacción registrada' } } }
      },

      // ── ALMACENES ─────────────────────────────────────────────────────────
      '/warehouses': {
        get: { tags: ['Almacenes'], summary: 'Listar almacenes', responses: { 200: { description: 'Lista de almacenes' } } },
        post: { tags: ['Almacenes'], summary: 'Crear almacén (admin)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, code: { type: 'string' }, address: { type: 'string' }, isDefault: { type: 'boolean' } } } } } }, responses: { 201: { description: 'Almacén creado' } } }
      },
      '/warehouses/{id}': {
        get: { tags: ['Almacenes'], summary: 'Obtener almacén por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Almacén' } } },
        put: { tags: ['Almacenes'], summary: 'Actualizar almacén (admin)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, isDefault: { type: 'boolean' }, isActive: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Almacén actualizado' } } }
      },

      // ── STOCK ─────────────────────────────────────────────────────────────
      '/stock': {
        get: { tags: ['Stock'], summary: 'Listar niveles de stock', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }], responses: { 200: { description: 'Saldos de stock por producto y almacén' } } }
      },
      '/stock/movements': {
        get: { tags: ['Stock'], summary: 'Historial de movimientos de stock', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }], responses: { 200: { description: 'Movimientos de entrada y salida' } } }
      },
      '/stock/adjust': {
        post: { tags: ['Stock'], summary: 'Ajuste manual de stock', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['productId', 'warehouseId', 'quantity'], properties: { productId: { type: 'string', format: 'uuid' }, warehouseId: { type: 'string', format: 'uuid' }, quantity: { type: 'number', description: 'Positivo = entrada, negativo = salida' }, notes: { type: 'string' } } } } } }, responses: { 200: { description: 'Stock ajustado' } } }
      },

      // ── ÓRDENES DE COMPRA ─────────────────────────────────────────────────
      '/purchase-orders': {
        get: { tags: ['Órdenes de compra'], summary: 'Listar órdenes de compra', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }], responses: { 200: { description: 'Lista de órdenes de compra' } } },
        post: {
          tags: ['Órdenes de compra'], summary: 'Crear orden de compra',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object', required: ['supplierId', 'items'],
                  properties: {
                    supplierId: { type: 'string', format: 'uuid' },
                    orderNumber: { type: 'string' }, orderDate: { type: 'string', format: 'date' },
                    expectedDate: { type: 'string', format: 'date' }, notes: { type: 'string' },
                    items: { type: 'array', items: { type: 'object', required: ['productId', 'quantity', 'unitCost'], properties: { productId: { type: 'string' }, quantity: { type: 'number' }, unitCost: { type: 'number' }, taxRate: { type: 'number' } } } }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Orden de compra creada' } }
        }
      },
      '/purchase-orders/{id}': {
        get: { tags: ['Órdenes de compra'], summary: 'Obtener orden de compra por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Orden de compra' } } }
      },
      '/purchase-orders/{id}/receive': {
        post: { tags: ['Órdenes de compra'], summary: 'Recibir orden (ingresa al stock)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Orden recibida y stock actualizado' } } }
      },
      '/purchase-orders/{id}/cancel': {
        post: { tags: ['Órdenes de compra'], summary: 'Cancelar orden de compra', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Orden cancelada' } } }
      },

      // ── ÓRDENES DE VENTA ──────────────────────────────────────────────────
      '/sales-orders': {
        get: { tags: ['Órdenes de venta'], summary: 'Listar órdenes de venta', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }], responses: { 200: { description: 'Lista de órdenes de venta' } } },
        post: {
          tags: ['Órdenes de venta'], summary: 'Crear orden de venta (cotización)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object', required: ['customerId', 'items'],
                  properties: {
                    customerId: { type: 'string', format: 'uuid' },
                    orderNumber: { type: 'string' }, orderDate: { type: 'string', format: 'date' },
                    validUntil: { type: 'string', format: 'date' }, notes: { type: 'string' },
                    items: { type: 'array', items: { type: 'object', required: ['productId', 'quantity', 'unitPrice'], properties: { productId: { type: 'string' }, quantity: { type: 'number' }, unitPrice: { type: 'number' }, taxRate: { type: 'number' }, discountRate: { type: 'number' } } } }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Orden de venta creada' } }
        }
      },
      '/sales-orders/{id}': {
        get: { tags: ['Órdenes de venta'], summary: 'Obtener orden de venta por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Orden de venta' } } }
      },
      '/sales-orders/{id}/confirm': {
        post: { tags: ['Órdenes de venta'], summary: 'Confirmar cotización (reserva stock)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Orden confirmada' } } }
      },
      '/sales-orders/{id}/deliver': {
        post: { tags: ['Órdenes de venta'], summary: 'Marcar como entregada (descuenta stock)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Orden entregada' } } }
      },
      '/sales-orders/{id}/cancel': {
        post: { tags: ['Órdenes de venta'], summary: 'Cancelar orden de venta', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Orden cancelada' } } }
      },

      // ── FACTURAS ──────────────────────────────────────────────────────────
      '/invoices': {
        get: { tags: ['Facturas'], summary: 'Listar facturas', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }], responses: { 200: { description: 'Lista de facturas' } } },
        post: { tags: ['Facturas'], summary: 'Crear factura desde una orden de venta', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['salesOrderId'], properties: { salesOrderId: { type: 'string', format: 'uuid' }, invoiceNumber: { type: 'string' }, dueDate: { type: 'string', format: 'date' }, notes: { type: 'string' } } } } } }, responses: { 201: { description: 'Factura creada' } } }
      },
      '/invoices/{id}': {
        get: { tags: ['Facturas'], summary: 'Obtener factura por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Factura con pagos' } } }
      },
      '/invoices/{id}/payments': {
        post: { tags: ['Facturas'], summary: 'Registrar pago', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['amount', 'paymentMethod'], properties: { amount: { type: 'number' }, paymentMethod: { type: 'string', example: 'transferencia' }, paymentDate: { type: 'string', format: 'date' }, reference: { type: 'string' }, notes: { type: 'string' } } } } } }, responses: { 200: { description: 'Pago registrado' } } }
      },
      '/invoices/{id}/cancel': {
        post: { tags: ['Facturas'], summary: 'Anular factura (solo sin pagos)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Factura anulada' } } }
      },

      // ── DEMO ──────────────────────────────────────────────────────────────
      '/demo-requests': {
        post: { tags: ['Demo'], summary: 'Solicitar demo (pública, sin autenticación)', security: [], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'company', 'email'], properties: { name: { type: 'string', example: 'Juan Pérez' }, company: { type: 'string', example: 'Mi Empresa SAS' }, email: { type: 'string', format: 'email' } } } } } }, responses: { 201: { description: 'Solicitud recibida' } } },
        get: { tags: ['Demo'], summary: 'Listar solicitudes de demo (requiere JWT)', parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }], responses: { 200: { description: 'Lista de solicitudes' } } }
      }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
