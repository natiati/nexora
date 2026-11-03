import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { forgotPassword } from '../api/resources';
import AuthCard from '../components/AuthCard';
import ErrorMessage from '../components/ErrorMessage';

const BACK_TO_LOGIN = { to: '/login', label: '← Volver a iniciar sesión' };

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard subtitle="Revisa tu correo" back={BACK_TO_LOGIN}>
        {/* El servidor responde igual exista o no la cuenta, así que el texto no puede afirmarlo */}
        <p className="text-sm text-slate-600">
          Si <b className="font-medium text-slate-900">{email}</b> está registrado, te enviamos un enlace para
          cambiar la contraseña. Vence en 1 hora; si no lo ves, revisa también la carpeta de spam.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard subtitle="Te enviaremos un enlace para cambiar tu contraseña" back={BACK_TO_LOGIN}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label htmlFor="email" className="ui-label">Correo de tu cuenta</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="tu@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="ui-input mb-5"
        />

        <button type="submit" disabled={loading} className="ui-btn w-full">
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>
    </AuthCard>
  );
}
