import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests - only for admin routes
api.interceptors.request.use((config) => {
  // Only add admin token for admin API routes or when on admin pages
  const isAdminApiRoute = config.url?.startsWith('/auth') || 
                         config.url?.includes('/admin') ||
                         window.location.pathname.startsWith('/admin');
  
  if (isAdminApiRoute) {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// Handle token refresh on 401 - only redirect for admin routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to admin login if we're on an admin page
      const isAdminPage = window.location.pathname.startsWith('/admin');
      const isLoginPage = window.location.pathname === '/admin/login';
      
      if (isAdminPage && !isLoginPage) {
        localStorage.removeItem('adminToken');
        // Use replace to avoid adding to history stack
        window.location.replace('/admin/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
