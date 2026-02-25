import api from '../config/api';

export const categoryService = {
  getAll: () =>
    api.get('/categories'),

  getById: (id) =>
    api.get(`/categories/${id}`),

  create: (name, description, imageFile) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: (id, name, description, imageFile) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return api.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id) =>
    api.delete(`/categories/${id}`),
};
