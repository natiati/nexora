// Datos del usuario guardados en el navegador tras el login
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) ?? {};
  } catch {
    return {};
  }
}

export function hasSession() {
  return Boolean(localStorage.getItem('token'));
}

export function isAdmin() {
  return getUser().role === 'admin';
}

export function saveSession({ token, user }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function logout() {
  clearSession();
  window.location.href = '/login';
}
