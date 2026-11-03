// Una celda que empieza con = + - @ se ejecutaría como fórmula al abrir el archivo en Excel
function cell(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

// Descarga una tabla como CSV. El BOM hace que Excel respete las tildes.
export function downloadCsv(filename, headers, rows) {
  const content = [headers, ...rows].map((row) => row.map(cell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
