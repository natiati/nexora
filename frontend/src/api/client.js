// frontend/src/api/client.js
import axios from 'axios';

// Instancia de axios con la URL base de la API (VITE_API_URL en producción)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

// Agrega el token guardado en el login a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Si el token venció o no es válido, se limpia la sesión y se vuelve al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.endsWith('/login');

    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Convierte un error de axios en un mensaje legible para mostrar en pantalla
export function getErrorMessage(error, fallback = 'Ocurrió un error, intenta de nuevo') {
  if (!error.response) {
    return 'No se pudo conectar con el servidor';
  }

  const { error: message, details } = error.response.data ?? {};

  if (details?.length) {
    return `${message}: ${details.map((d) => `${d.field} ${d.message}`).join(', ')}`;
  }

  return message || fallback;
}

export default api;
