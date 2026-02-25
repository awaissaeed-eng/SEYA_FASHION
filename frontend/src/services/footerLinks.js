import api from '../config/api';

export const footerLinksService = {
  getAll: () => api.get('/footer-links'),
  getFloatingIcons: () => api.get('/footer-links/floating'),
  create: (data) => api.post('/footer-links', data),
  update: (id, data) => api.put(`/footer-links/${id}`, data),
  delete: (id) => api.delete(`/footer-links/${id}`),
};
