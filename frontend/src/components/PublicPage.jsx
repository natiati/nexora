import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// Marco de las páginas informativas públicas (Nosotros, Privacidad, Términos)
export default function PublicPage({ title, children }) {
  // Se llega desde el pie de la landing: la página debe empezar arriba
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl"><Logo /></Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">← Volver al inicio</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-semibold mb-6">{title}</h1>
        <div className="space-y-4 text-slate-600 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:pt-3 [&_a]:text-teal-700 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200">
        <nav className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
          <Link to="/nosotros" className="hover:text-slate-900">Nosotros</Link>
          <Link to="/privacidad" className="hover:text-slate-900">Privacidad</Link>
          <Link to="/terminos" className="hover:text-slate-900">Términos</Link>
          <Link to="/#precios" className="hover:text-slate-900">Precios</Link>
          <Link to="/#contacto" className="hover:text-slate-900">Contacto</Link>
        </nav>
      </footer>
    </div>
  );
}
