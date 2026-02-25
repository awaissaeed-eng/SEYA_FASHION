import api from '../config/api';

export const supportService = {
  // Public endpoints (for user frontend)
  getSupportCards: async () => {
    const res = await api.get('/support/cards');
    return res.data;
  },

  getFAQs: async () => {
    const res = await api.get('/support/faqs');
    return res.data;
  },

  getContactInfo: async () => {
    const res = await api.get('/support/contact-info');
    return res.data;
  },

  getWhatsAppSettings: async () => {
    const res = await api.get('/support/whatsapp');
    return res.data;
  },

  getPolicies: async () => {
    const res = await api.get('/support/policies');
    return res.data;
  },

  sendContactMessage: async (data) => {
    const res = await api.post('/support/messages', data);
    return res.data;
  },

  // Admin endpoints - Support Cards
  adminGetSupportCards: async () => {
    const res = await api.get('/support/admin/cards');
    return res.data;
  },

  adminCreateSupportCard: async (data) => {
    const res = await api.post('/support/admin/cards', data);
    return res.data;
  },

  adminUpdateSupportCard: async (id, data) => {
    const res = await api.put(`/support/admin/cards/${id}`, data);
    return res.data;
  },

  adminDeleteSupportCard: async (id) => {
    const res = await api.delete(`/support/admin/cards/${id}`);
    return res.data;
  },

  // Admin endpoints - FAQs
  adminGetFAQs: async () => {
    const res = await api.get('/support/admin/faqs');
    return res.data;
  },

  adminCreateFAQ: async (data) => {
    const res = await api.post('/support/admin/faqs', data);
    return res.data;
  },

  adminUpdateFAQ: async (id, data) => {
    const res = await api.put(`/support/admin/faqs/${id}`, data);
    return res.data;
  },

  adminDeleteFAQ: async (id) => {
    const res = await api.delete(`/support/admin/faqs/${id}`);
    return res.data;
  },

  // Admin endpoints - Contact Messages
  adminGetContactMessages: async () => {
    const res = await api.get('/support/admin/messages');
    return res.data;
  },

  adminMarkMessageRead: async (id) => {
    const res = await api.put(`/support/admin/messages/${id}/read`);
    return res.data;
  },

  adminDeleteContactMessage: async (id) => {
    const res = await api.delete(`/support/admin/messages/${id}`);
    return res.data;
  },

  // Admin endpoints - Contact Info
  adminGetContactInfo: async () => {
    const res = await api.get('/support/admin/contact-info');
    return res.data;
  },

  adminCreateContactInfo: async (data) => {
    const res = await api.post('/support/admin/contact-info', data);
    return res.data;
  },

  adminUpdateContactInfo: async (id, data) => {
    const res = await api.put(`/support/admin/contact-info/${id}`, data);
    return res.data;
  },

  adminDeleteContactInfo: async (id) => {
    const res = await api.delete(`/support/admin/contact-info/${id}`);
    return res.data;
  },

  // Admin endpoints - WhatsApp Settings
  adminUpdateWhatsAppSettings: async (data) => {
    const res = await api.put('/support/admin/whatsapp', data);
    return res.data;
  },

  // Admin endpoints - Policies
  adminGetPolicies: async () => {
    const res = await api.get('/support/admin/policies');
    return res.data;
  },

  adminCreatePolicy: async (data) => {
    const res = await api.post('/support/admin/policies', data);
    return res.data;
  },

  adminUpdatePolicy: async (id, data) => {
    const res = await api.put(`/support/admin/policies/${id}`, data);
    return res.data;
  },

  adminDeletePolicy: async (id) => {
    const res = await api.delete(`/support/admin/policies/${id}`);
    return res.data;
  }
};

// Also export individual functions for backward compatibility
export const {
  getSupportCards,
  getFAQs,
  getContactInfo,
  getWhatsAppSettings,
  getPolicies,
  sendContactMessage,
  adminGetSupportCards,
  adminCreateSupportCard,
  adminUpdateSupportCard,
  adminDeleteSupportCard,
  adminGetFAQs,
  adminCreateFAQ,
  adminUpdateFAQ,
  adminDeleteFAQ,
  adminGetContactMessages,
  adminMarkMessageRead,
  adminDeleteContactMessage,
  adminGetContactInfo,
  adminCreateContactInfo,
  adminUpdateContactInfo,
  adminDeleteContactInfo,
  adminUpdateWhatsAppSettings,
  adminGetPolicies,
  adminCreatePolicy,
  adminUpdatePolicy,
  adminDeletePolicy
} = supportService;
