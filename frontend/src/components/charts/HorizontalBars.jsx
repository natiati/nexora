// Barras horizontales con el valor en la punta. rows: [{ id, name, detail, value }]
export default function HorizontalBars({ rows, color, formatValue, emptyText }) {
  const max = Math.max(...rows.map((row) => row.value), 0);

  if (max === 0) {
    return <p className="text-sm text-slate-400 py-8 text-center">{emptyText}</p>;
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.id} className="text-xs">
          <div className="flex justify-between gap-3 mb-1">
            <span className="text-slate-700 truncate">{row.name}</span>
            {row.detail && <span className="text-slate-400 shrink-0">{row.detail}</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div
                className="h-3 rounded-r"
                style={{ background: color, width: `${(row.value / max) * 100}%`, minWidth: row.value > 0 ? 2 : 0 }}
              />
            </div>
            <b className="font-semibold text-slate-900 shrink-0">{formatValue(row.value)}</b>
          </div>
        </li>
      ))}
    </ul>
  );
}
