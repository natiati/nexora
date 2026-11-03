export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
      <span>{total} registros · página {page} de {pages}</span>
      <div className="flex gap-2">
        <button className="ui-btn-outline !py-1 !px-3" disabled={page <= 1} onClick={() => onChange(page - 1)}>Anterior</button>
        <button className="ui-btn-outline !py-1 !px-3" disabled={page >= pages} onClick={() => onChange(page + 1)}>Siguiente</button>
      </div>
    </div>
  );
}
