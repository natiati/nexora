import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { useList } from '../hooks/useList';
import ErrorMessage from './ErrorMessage';
import { FieldGrid } from './FormFields';
import Modal from './Modal';
import PageHeader from './PageHeader';
import Pagination from './Pagination';

// Valores iniciales del formulario: los del registro al editar, vacíos al crear
function initialValues(fields, row) {
  return Object.fromEntries(fields.map((field) => {
    const raw = row ? (field.getValue ? field.getValue(row) : row[field.name]) : field.defaultValue;
    if (field.type === 'checkbox') return [field.name, raw ?? false];
    return [field.name, raw ?? ''];
  }));
}

// Los campos vacíos viajan como null para poder borrar un dato al editar
function toBody(fields, values) {
  return Object.fromEntries(fields.map((field) => {
    const value = values[field.name];
    return [field.name, value === '' ? null : value];
  }));
}

/**
 * Página estándar de un catálogo: búsqueda, tabla paginada y formulario de crear/editar.
 * Cada página solo describe sus columnas y campos.
 */
export default function CrudPage({
  title,
  subtitle,
  api,
  columns,
  fields,
  createLabel = 'Nuevo',
  searchPlaceholder,
  canEdit = true,
  canDelete = true,
  canCreate = true,
  deleteLabel = 'Eliminar',
  rowActions,
}) {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | registro
  const [values, setValues] = useState({});
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const list = useList(api, { query });
  const isNew = editing === 'new';
  const visibleFields = fields.filter((field) => (isNew ? !field.editOnly : !field.createOnly));

  const openForm = (row) => {
    const target = row ?? 'new';
    setFormError('');
    setValues(initialValues(fields.filter((field) => (row ? !field.createOnly : !field.editOnly)), row));
    setEditing(target);
  };

  const closeForm = () => setEditing(null);

  const submitSearch = (e) => {
    e.preventDefault();
    list.setPage(1);
    setQuery(search.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      const body = toBody(visibleFields, values);
      if (isNew) {
        await api.create(body);
      } else {
        await api.update(editing.id, body);
      }
      closeForm();
      list.reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`¿${deleteLabel} "${row.name ?? row.email}"?`)) return;
    setError('');

    try {
      await api.remove(row.id);
      list.reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const hasActions = canEdit || canDelete || rowActions;

  return (
    <div className="p-4 sm:p-8">
      <PageHeader title={title} subtitle={subtitle}>
        {canCreate && <button className="ui-btn" onClick={() => openForm()}>+ {createLabel}</button>}
      </PageHeader>

      <ErrorMessage message={error || list.error} />

      {searchPlaceholder && (
        <form onSubmit={submitSearch} className="flex gap-2 mb-4 max-w-md">
          <input className="ui-input" type="search" placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="ui-btn-outline">Buscar</button>
        </form>
      )}

      <div className="ui-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr>
                {columns.map((column) => <th key={column.label}>{column.label}</th>)}
                {hasActions && <th className="text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {list.rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.label} className={column.strong ? '!text-slate-900 font-medium' : ''}>
                      {column.render ? column.render(row) : (row[column.key] ?? '—')}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="whitespace-nowrap text-right space-x-3">
                      {rowActions?.(row, list.reload)}
                      {canEdit && <button className="ui-link" onClick={() => openForm(row)}>Editar</button>}
                      {canDelete && (typeof canDelete !== 'function' || canDelete(row)) && (
                        <button className="ui-link-danger" onClick={() => handleDelete(row)}>{deleteLabel}</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {list.rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="!text-slate-400 text-center !py-8">
                    {list.loading ? 'Cargando…' : query ? 'Sin resultados para esa búsqueda.' : 'Todavía no hay registros.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onChange={list.setPage} />
      </div>

      {editing && (
        <Modal title={`${isNew ? createLabel : 'Editar'} · ${title}`} onClose={closeForm}>
          <form onSubmit={handleSubmit}>
            <ErrorMessage message={formError} />
            <FieldGrid fields={visibleFields} values={values} onChange={setValues} />
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" className="ui-btn-outline" onClick={closeForm}>Cancelar</button>
              <button className="ui-btn" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
