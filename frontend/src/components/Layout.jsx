import { useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { getUser, hasSession, isAdmin, logout } from '../api/session';
import Logo from './Logo';
import { navGroups } from './navigation';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Sin sesión no se puede ver ninguna página interna
  if (!hasSession()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const user = getUser();
  const groups = navGroups.filter((group) => !group.adminOnly || isAdmin());

  return (
    <div className="flex min-h-screen bg-slate-100">
      {menuOpen && <div className="fixed inset-0 z-20 bg-slate-900/40 md:hidden" onClick={() => setMenuOpen(false)} />}

      <aside className={`fixed md:sticky top-0 z-30 h-screen w-56 bg-slate-900 shrink-0 py-5 px-3 overflow-y-auto transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="text-white text-lg px-2 mb-5"><Logo /></div>
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 px-3 mb-1">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-r-lg mb-0.5 text-sm border-l-4 ${
                    isActive
                      ? 'bg-teal-700/20 text-teal-300 border-teal-400'
                      : 'text-slate-300 border-transparent hover:bg-white/5'
                  }`
                }
              >
                <span className="text-xs w-3 text-center">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden text-slate-600 text-lg cursor-pointer" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>☰</button>
            <span className="text-sm font-semibold text-slate-900 truncate">{user.companyName ?? 'Nexora'}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-slate-700 leading-tight">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-slate-400 leading-tight">{user.roleName}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white text-xs font-medium flex items-center justify-center">
              {user.firstName ? user.firstName[0] : 'U'}
            </div>
            <button onClick={logout} className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer">Salir</button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
