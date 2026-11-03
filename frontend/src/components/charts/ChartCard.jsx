import { useState } from 'react';

// Tarjeta de un reporte. Toda gráfica tiene su tabla: nada queda disponible solo por color o al pasar el mouse.
export default function ChartCard({ title, subtitle, legend, table, onExport, className = '', children }) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section className={`ui-card p-5 min-w-0 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-3">
          {table && children && (
            <button className="ui-link" onClick={() => setShowTable(!showTable)}>{showTable ? 'Ver gráfica' : 'Ver tabla'}</button>
          )}
          {onExport && <button className="ui-link" onClick={onExport}>Exportar CSV</button>}
        </div>
      </div>

      {!showTable && legend && (
        <ul className="flex flex-wrap gap-4 mb-3">
          {legend.map((item) => (
            <li key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
              {item.name}
            </li>
          ))}
        </ul>
      )}

      {showTable || !children ? <div className="overflow-x-auto">{table}</div> : children}
    </section>
  );
}
