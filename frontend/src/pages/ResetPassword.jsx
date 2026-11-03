import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { resetPassword } from '../api/resources';
import { clearSession } from '../api/session';
import AuthCard from '../components/AuthCard';
import ErrorMessage from '../components/ErrorMessage';

const MIN_LENGTH = 8;
const BACK_TO_LOGIN = { to: '/login', label: '← Volver a iniciar sesión' };

export default function ResetPassword() {
  const location = useLocation();
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get('token'));
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // El enlace no debe quedar visible en la barra de direcciones ni en el historial
  useEffect(() => {
    window.history.replaceState(window.history.state, '', location.pathname);
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ token, password });
      clearSession();
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthCard subtitle="Contraseña actualizada" back={BACK_TO_LOGIN}>
        <p className="text-sm text-slate-600 mb-5">Ya puedes entrar con tu nueva contraseña. Las sesiones abiertas se cerraron.</p>
        <Link to="/login" className="ui-btn w-full">Iniciar sesión</Link>
      </AuthCard>
    );
  }

  if (!token) {
    return (
      <AuthCard subtitle="Enlace no válido" back={BACK_TO_LOGIN}>
        <p className="text-sm text-slate-600 mb-5">Este enlace está incompleto. Solicita uno nuevo.</p>
        <Link to="/recuperar-contrasena" className="ui-btn w-full">Solicitar enlace</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard subtitle="Elige tu nueva contraseña" back={BACK_TO_LOGIN}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label htmlFor="password" className="ui-label">Nueva contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_LENGTH}
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          className="ui-input"
        />
        <p className="text-xs text-slate-400 mt-1 mb-3">Mínimo {MIN_LENGTH} caracteres</p>

        <label htmlFor="confirmation" className="ui-label">Repite la contraseña</label>
        <input
          id="confirmation"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          required
          className="ui-input mb-5"
        />

        <button type="submit" disabled={loading} className="ui-btn w-full">
          {loading ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </AuthCard>
  );
}
