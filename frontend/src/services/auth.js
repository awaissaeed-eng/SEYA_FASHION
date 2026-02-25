import api from '../config/api';

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getMe: () =>
    api.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('adminToken');
    return Promise.resolve();
  },
};
