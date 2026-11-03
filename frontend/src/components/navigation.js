// Menú de la aplicación. También lo usa la vista previa de la landing.
export const navGroups = [
  {
    label: 'Operación',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: '▦' },
      { to: '/sales', label: 'Ventas', icon: '↗' },
      { to: '/purchases', label: 'Compras', icon: '↙' },
      { to: '/invoices', label: 'Facturas', icon: '▧' },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { to: '/products', label: 'Productos', icon: '◈' },
      { to: '/stock', label: 'Existencias', icon: '▤' },
      { to: '/warehouses', label: 'Almacenes', icon: '⌂' },
      { to: '/categories', label: 'Categorías', icon: '◇' },
      { to: '/units', label: 'Unidades', icon: '#' },
    ],
  },
  {
    label: 'Contactos',
    items: [
      { to: '/customers', label: 'Clientes', icon: '◍' },
      { to: '/suppliers', label: 'Proveedores', icon: '◎' },
      { to: '/demo-requests', label: 'Solicitudes de demo', icon: '✉' },
    ],
  },
  {
    label: 'Administración',
    adminOnly: true,
    items: [
      { to: '/users', label: 'Usuarios', icon: '☺' },
      { to: '/roles', label: 'Roles', icon: '✦' },
      { to: '/company', label: 'Empresa', icon: '▣' },
    ],
  },
];
