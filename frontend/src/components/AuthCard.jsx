import { Link } from 'react-router-dom';
import Logo from './Logo';

// Marco de las pantallas de acceso: inicio de sesión y recuperación de contraseña
export default function AuthCard({ subtitle, back = { to: '/', label: '← Volver al inicio' }, footer, children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <Link to={back.to} className="inline-block text-sm text-slate-500 hover:text-slate-900 mb-5">{back.label}</Link>

        <div className="ui-card p-7 shadow-sm">
          <div className="text-2xl text-slate-900 mb-1"><Logo /></div>
          <h1 className="text-sm text-slate-500 mb-5">{subtitle}</h1>
          {children}
        </div>

        {footer}
      </div>
    </div>
  );
}
