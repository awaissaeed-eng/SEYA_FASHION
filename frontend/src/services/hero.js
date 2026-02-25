import api from '../config/api';

export const heroService = {
  // Get hero settings (public)
  getSettings: async () => {
    return api.get('/hero');
  },

  // Update hero settings (admin)
  updateSettings: async (settings) => {
    return api.put('/hero/settings', settings);
  },

  // Upload hero images (admin)
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/hero/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Upload hero video (admin)
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post('/hero/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete hero image (admin)
  deleteImage: async (imageUrl) => {
    return api.delete('/hero/image', { data: { imageUrl } });
  },

  // Delete hero video (admin)
  deleteVideo: async () => {
    return api.delete('/hero/video');
  },

  // Reorder hero images (admin)
  reorderImages: async (images) => {
    return api.put('/hero/reorder', { images });
  },
};
