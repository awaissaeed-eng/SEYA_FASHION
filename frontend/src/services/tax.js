import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/tax`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const gstService = {
  // Get current GST settings
  getGstSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update GST settings (admin only)
  updateGstSettings: async (gstData) => {
    const response = await api.put('/settings', gstData);
    return response.data;
  },

  // Get GST calculation for given subtotal
  getGstCalculation: async (subtotal) => {
    const response = await api.get(`/calculate?subtotal=${subtotal}`);
    return response.data;
  },

  // Legacy function names for backward compatibility
  getTaxSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateTaxSettings: async (taxData) => {
    const response = await api.put('/settings', taxData);
    return response.data;
  },

  getTaxCalculation: async (subtotal) => {
    const response = await api.get(`/calculate?subtotal=${subtotal}`);
    return response.data;
  },
};

// Legacy support - keep old names for backward compatibility
export const taxService = gstService;