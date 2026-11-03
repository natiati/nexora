// Una función por cada recurso de la API: las páginas no escriben URLs ni tratan con axios
import api from './client';

function resource(path) {
  return {
    list: (params) =>
      api.get(path, { params }).then((res) => ({
        data: res.data,
        total: Number(res.headers['x-total-count'] ?? res.data.length),
      })),
    create: (body) => api.post(path, body).then((res) => res.data),
    update: (id, body) => api.put(`${path}/${id}`, body).then((res) => res.data),
    remove: (id) => api.delete(`${path}/${id}`),
    action: (id, name, body) => api.post(`${path}/${id}/${name}`, body).then((res) => res.data),
  };
}

export const login = (credentials) => api.post('/login', credentials).then((res) => res.data);

export const forgotPassword = (body) => api.post('/password/forgot', body).then((res) => res.data);
export const resetPassword = (body) => api.post('/password/reset', body).then((res) => res.data);

export const requestDemo = (body) => api.post('/demo-requests', body).then((res) => res.data);
export const demoRequestsApi = resource('/demo-requests');

export const productsApi = resource('/products');
export const categoriesApi = resource('/categories');
export const unitsApi = resource('/units');
export const customersApi = {
  ...resource('/customers'),
  interactions: (id) => api.get(`/customers/${id}/interactions`).then((res) => res.data),
  addInteraction: (id, body) => api.post(`/customers/${id}/interactions`, body).then((res) => res.data),
};
export const suppliersApi = resource('/suppliers');
export const warehousesApi = resource('/warehouses');
export const usersApi = resource('/users');
export const rolesApi = resource('/roles');
export const salesOrdersApi = resource('/sales-orders');
export const purchaseOrdersApi = resource('/purchase-orders');
export const invoicesApi = resource('/invoices');
export const stockApi = {
  ...resource('/stock'),
  adjust: (body) => api.post('/stock/adjust', body).then((res) => res.data),
};
export const stockMovementsApi = resource('/stock/movements');
export const companyApi = {
  get: () => api.get('/company').then((res) => res.data),
  update: (body) => api.put('/company', body).then((res) => res.data),
};
export const dashboardApi = {
  get: (months) => api.get('/dashboard', { params: { months } }).then((res) => res.data),
};
