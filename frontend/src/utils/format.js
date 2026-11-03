export function money(value) {
  return `$${Number(value ?? 0).toLocaleString('es-CO', { maximumFractionDigits: 2 })}`;
}

// Para los ejes de las gráficas: $1,5 M
export function moneyCompact(value) {
  return `$${Number(value ?? 0).toLocaleString('es-CO', { notation: 'compact', maximumFractionDigits: 1 })}`;
}

// "2026-06" → "jun" o, con el año, "jun 2026"
export function monthLabel(month, withYear = false) {
  const name = new Date(`${month}-01T00:00:00Z`)
    .toLocaleDateString('es-CO', { timeZone: 'UTC', month: 'short' })
    .replace('.', '');
  return withYear ? `${name} ${month.slice(0, 4)}` : name;
}

export function quantity(value) {
  return Number(value ?? 0).toLocaleString('es-CO', { maximumFractionDigits: 3 });
}

// Columnas DATE: llegan a medianoche UTC, así que se muestran en UTC para no restar un día
export function date(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-CO', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });
}

export function dateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

// Fecha de hoy en la hora local, en el formato de <input type="date">
export function todayInput() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
