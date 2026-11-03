import { moneyCompact } from '../../utils/format';

const TICKS = 4;

// Tope redondo del eje: 1, 2, 2,5 o 5 × potencia de 10
function niceMax(value) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((n) => n * power >= value);
  return step * power;
}

/**
 * Columnas agrupadas en HTML: el texto queda nítido y se adapta al ancho sin escalar.
 * rows: [{ key, label, title, values: [número por serie] }] · series: [{ name, color }]
 */
export default function GroupedColumnChart({ rows, series, formatValue }) {
  const max = niceMax(Math.max(...rows.flatMap((row) => row.values)));
  const ticks = Array.from({ length: TICKS + 1 }, (_, index) => (max / TICKS) * (TICKS - index));

  return (
    <div className="flex">
      {/* Eje Y */}
      <div className="relative w-14 h-52 shrink-0 text-[11px] text-slate-400" aria-hidden="true">
        {ticks.map((tick, index) => (
          <span key={tick} className="absolute right-2 -translate-y-1/2" style={{ top: `${(index / TICKS) * 100}%` }}>
            {moneyCompact(tick)}
          </span>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <div className="relative h-52 border-b border-slate-200">
          {ticks.slice(0, -1).map((tick, index) => (
            <div key={tick} className="absolute inset-x-0 border-t border-slate-100" style={{ top: `${(index / TICKS) * 100}%` }} />
          ))}

          <div className="absolute inset-0 flex">
            {rows.map((row, rowIndex) => {
              const edge = rowIndex === 0 ? 'left-0' : rowIndex === rows.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2';

              return (
                <div
                  key={row.key}
                  tabIndex={0}
                  role="img"
                  aria-label={`${row.title}: ${series.map((s, i) => `${s.name} ${formatValue(row.values[i])}`).join(', ')}`}
                  className="group relative flex-1 min-w-0 flex items-end justify-center gap-0.5 px-1 rounded hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                >
                  {row.values.map((value, index) => (
                    <div
                      key={series[index].name}
                      className="flex-1 max-w-6 rounded-t"
                      style={{
                        background: series[index].color,
                        height: `${(value / max) * 100}%`,
                        minHeight: value > 0 ? 2 : 0,
                      }}
                    />
                  ))}

                  <div className={`absolute bottom-full mb-1 z-10 hidden group-hover:block group-focus:block pointer-events-none ${edge} bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 whitespace-nowrap`}>
                    <div className="text-xs text-slate-500 mb-1">{row.title}</div>
                    {series.map((s, index) => (
                      <div key={s.name} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-0.5 rounded-full" style={{ background: s.color }} />
                        <b className="font-semibold text-slate-900">{formatValue(row.values[index])}</b>
                        <span className="text-slate-500">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex mt-1.5" aria-hidden="true">
          {rows.map((row) => (
            <div key={row.key} className="flex-1 min-w-0 text-center text-[11px] text-slate-500 truncate">{row.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
