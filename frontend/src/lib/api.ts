import axios from 'axios';

/**
 * En el celular (IP de red local) no usar localhost:4000.
 * El proxy /api de Next reenvía al backend en la PC.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  }

  const host = window.location.hostname;
  const onLocalPc = host === 'localhost' || host === '127.0.0.1';

  if (!onLocalPc) {
    return '/api';
  }

  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (env && !env.includes('localhost:4000') && !env.includes('127.0.0.1:4000')) {
    return env;
  }

  return '/api';
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('meps_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        localStorage.removeItem('meps_token');
        localStorage.removeItem('meps_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data, { timeout: 120000 }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  getStats: () => api.get('/users/stats'),
  updateProfile: (data: { name?: string }) => api.put('/users/profile', data),
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/users/password', { currentPassword, newPassword }),
};

export const documentApi = {
  list: () => api.get('/documents'),
  upload: (formData: FormData) => api.post('/documents/upload', formData),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const translationApi = {
  getLanguages: () => api.get('/translations/languages'),
  get: (id: string) => api.get(`/translations/${id}`),
  list: (params?: { page?: number; status?: string }) => api.get('/translations', { params }),
  create: (formData: FormData) =>
    api.post('/translations', formData, { timeout: 60000 }),
  download: (id: string) => api.get(`/translations/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/translations/${id}`),
};

export const libraryApi = {
  list: () => api.get('/library'),
  add: (data: { title: string; documentId?: string; category?: string }) => api.post('/library', data),
  toggleFavorite: (id: string) => api.put(`/library/${id}/favorite`),
};

export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrent: () => api.get('/subscriptions/current'),
  checkout: (plan: string) => api.post('/subscriptions/checkout', { plan }),
};

export const audiobookApi = {
  list: () => api.get('/audiobooks'),
  create: (data: { title: string; sourceText: string; language: string; voice?: string }) => api.post('/audiobooks', data),
  download: (id: string) => api.get(`/audiobooks/${id}/download`, { responseType: 'blob' }),
};

export const designApi = {
  getTemplates: () => api.get('/designs/templates'),
  list: () => api.get('/designs'),
  create: (data: object) => api.post('/designs', data),
  update: (id: string, data: object) => api.put(`/designs/${id}`, data),
};

export const chatApi = {
  getMessages: () => api.get('/chat'),
  send: (message: string) => api.post('/chat', { message }),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: { page?: number; search?: string }) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: object) => api.put(`/admin/users/${id}`, data),
  getLogs: () => api.get('/admin/logs'),
};

export const paymentApi = {
  list: () => api.get('/payments'),
};
