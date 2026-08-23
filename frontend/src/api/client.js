import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const apiBase = rawApiUrl ? `${rawApiUrl.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL: apiBase,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const complaintsApi = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  uploadPhoto: (formData) => api.post('/complaints/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, payload) => api.patch(`/complaints/${id}/status`, payload),
  updatePriority: (id, payload) => api.patch(`/complaints/${id}/priority`, payload),
};

export const noticesApi = {
  getAll: () => api.get('/notices'),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const settingsApi = {
  getOverdueThreshold: () => api.get('/settings/overdue-threshold'),
  updateOverdueThreshold: (days) => api.put('/settings/overdue-threshold', { days }),
};

export default api;
