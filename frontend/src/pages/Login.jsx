import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { login } from '../api/resources';
import { hasSession, saveSession } from '../api/session';
import AuthCard from '../components/AuthCard';
import ErrorMessage from '../components/ErrorMessage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Página que se quería abrir antes de pasar por el login
  const destination = location.state?.from ?? '/dashboard';

  // Quien ya inició sesión pasa directo al panel
  if (hasSession()) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      saveSession(await login({ email, password }));
      navigate(destination, { replace: true });
    } catch (err) {
      // 401 = credenciales; 429 = demasiados intentos; sin respuesta = servidor caído
      setError(
        err.response?.status === 401
          ? 'Correo o contraseña incorrectos'
          : getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  // Solo en desarrollo: en producción no se muestran credenciales
  const demoHint = import.meta.env.DEV && (
    <p className="text-xs text-slate-400 text-center mt-4">
      Demo: admin@nexora.com · vendedor@nexora.com — clave 123456
    </p>
  );

  return (
    <AuthCard subtitle="Inicia sesión para entrar a tu cuenta" footer={demoHint}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <label htmlFor="email" className="ui-label">Correo</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="tu@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="ui-input mb-3"
        />

        <div className="flex items-center justify-between">
          <label htmlFor="password" className="ui-label">Contraseña</label>
          <Link to="/recuperar-contrasena" className="text-xs text-teal-700 hover:text-teal-600 mb-1">¿La olvidaste?</Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="ui-input mb-5"
        />

        <button type="submit" disabled={loading} className="ui-btn w-full">
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthCard>
  );
}
