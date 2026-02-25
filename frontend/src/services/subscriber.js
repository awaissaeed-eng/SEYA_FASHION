import api from '../config/api';

export const subscriberService = {
  // Public - subscribe to newsletter
  subscribe: async (email) => {
    return api.post('/subscribers/subscribe', { email });
  },

  // Admin - test email configuration
  testEmailConfig: async () => {
    return api.get('/subscribers/test-email');
  },

  // Admin - get all subscribers
  getAll: async (status = '') => {
    const query = status ? `?status=${status}` : '';
    return api.get(`/subscribers${query}`);
  },

  // Admin - get stats
  getStats: async () => {
    return api.get('/subscribers/stats');
  },

  // Admin - update subscriber status
  updateStatus: async (id, status) => {
    return api.put(`/subscribers/${id}/status`, { status });
  },

  // Admin - delete subscriber
  delete: async (id) => {
    return api.delete(`/subscribers/${id}`);
  },

  // Admin - send notification to all subscribers
  sendNotification: async (type, data) => {
    return api.post('/subscribers/notify', { type, data });
  },

  // Admin - get email logs
  getEmailLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/subscribers/email-logs${query ? `?${query}` : ''}`);
  },

  // Admin - get email configuration status
  getEmailConfig: async () => {
    return api.get('/subscribers/email-config');
  },
};
