import { useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { companyApi } from '../api/resources';
import ErrorMessage from '../components/ErrorMessage';
import { FieldGrid } from '../components/FormFields';
import PageHeader from '../components/PageHeader';

const fields = [
  { name: 'name', label: 'Nombre comercial', required: true, maxLength: 150 },
  { name: 'legalName', label: 'Razón social', maxLength: 200 },
  { name: 'taxId', label: 'NIT', maxLength: 30 },
  { name: 'email', label: 'Correo', type: 'email', maxLength: 150 },
  { name: 'phone', label: 'Teléfono', maxLength: 30 },
  { name: 'city', label: 'Ciudad', maxLength: 100 },
  { name: 'country', label: 'País', maxLength: 80 },
  { name: 'address', label: 'Dirección', maxLength: 300 },
  { name: 'currency', label: 'Moneda (ISO)', required: true, maxLength: 3, help: 'Ejemplo: COP' },
  { name: 'timezone', label: 'Zona horaria', required: true, maxLength: 50, help: 'Ejemplo: America/Bogota' },
];

export default function Company() {
  const [values, setValues] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    companyApi.get()
      .then((company) => setValues(Object.fromEntries(fields.map((f) => [f.name, company[f.name] ?? '']))))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);

    try {
      await companyApi.update(values);
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <PageHeader title="Empresa" subtitle="Datos generales de tu organización" />

      <ErrorMessage message={error} />

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
          Cambios guardados. El nombre nuevo aparece en el encabezado la próxima vez que inicies sesión.
        </div>
      )}

      {values && (
        <form onSubmit={handleSubmit} className="ui-card p-5 max-w-3xl">
          <FieldGrid fields={fields} values={values} onChange={(next) => { setSaved(false); setValues(next); }} />
          <div className="flex justify-end mt-5">
            <button className="ui-btn" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
