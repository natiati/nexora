// frontend/src/api/client.js
import axios from 'axios';


// aqui estamos creando una instancia de axios con la URL base de nuestra API
const api = axios.create({
  baseURL: 'http://localhost:3000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // esta parte guarda el token en el localStorage y lo agrega a los headers de la solicitud cuando se hace login

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;