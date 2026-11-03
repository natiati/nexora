// Dibuja un formulario a partir de una lista de campos:
// { name, label, type, required, options: [{ value, label }], help, full }
export function Field({ field, value, onChange, disabled }) {
  const { name, label, type = 'text', required, options, help, placeholder, min, step, maxLength } = field;
  const id = `field-${name}`;

  if (type === 'checkbox') {
    return (
      <label htmlFor={id} className="flex items-center gap-2 text-sm text-slate-700 py-2">
        <input id={id} type="checkbox" checked={Boolean(value)} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-teal-700" />
        {label}
      </label>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="ui-label">{label}{required && ' *'}</label>
      {type === 'select' && (
        <select id={id} className="ui-input" value={value ?? ''} required={required} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecciona…</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
      {type === 'textarea' && (
        <textarea id={id} className="ui-input" rows={3} value={value ?? ''} required={required} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {type !== 'select' && type !== 'textarea' && (
        <input
          id={id}
          className="ui-input"
          type={type}
          value={value ?? ''}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          min={min ?? (type === 'number' ? 0 : undefined)}
          step={step ?? (type === 'number' ? 'any' : undefined)}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

export function FieldGrid({ fields, values, onChange, disabled }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map((field) => (
        <div key={field.name} className={field.full || field.type === 'textarea' ? 'sm:col-span-2' : ''}>
          <Field
            field={field}
            value={values[field.name]}
            disabled={disabled}
            onChange={(value) => onChange({ ...values, [field.name]: value })}
          />
        </div>
      ))}
    </div>
  );
}
