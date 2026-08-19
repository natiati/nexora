import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/products', label: 'Productos', icon: '◈' },
  { to: '/stock', label: 'Inventario', icon: '▤' },
  { to: '/sales', label: 'Ventas', icon: '↗' },
  { to: '/purchases', label: 'Compras', icon: '↙' },
  { to: '/customers', label: 'Clientes', icon: '◍' },
  { to: '/invoices', label: 'Facturas', icon: '▧' },
];

export default function Layout() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="flex min-h-screen">
      <aside className="w-52 bg-slate-900 shrink-0 py-5 px-3">
        <div className="text-white font-semibold text-base px-2 mb-6">Nexora</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2.5 rounded-r-lg mb-1 text-sm border-l-4 ${
                isActive
                  ? 'bg-teal-700/20 text-teal-300 border-teal-400'
                  : 'text-slate-300 border-transparent hover:bg-white/5'
              }`
            }
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </aside>

      <div className="flex-1 bg-slate-100 min-h-screen">
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-900">Nexora</span>
          <div className="w-7 h-7 rounded-full bg-teal-700 text-white text-xs font-medium flex items-center justify-center">
            {user.firstName ? user.firstName[0] : 'U'}
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}