import api from '../config/api';

export const productService = {
  // Get all products (public - only active products)
  getAll: async () => {
    return api.get('/products');
  },

  // Get all products for admin (includes inactive products)
  getAllAdmin: async () => {
    return api.get('/products/admin/all');
  },

  // Get product by ID
  getById: async (id) => {
    return api.get(`/products/${id}`);
  },

  // Create new product
  create: async (name, category, price, stock, description, images, sizes, details, isActive = true) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', parseFloat(price));
    formData.append('stock', parseInt(stock));
    formData.append('description', description);
    formData.append('details', details);
    formData.append('isActive', isActive);
    sizes.forEach((sizeObj, idx) => {
      formData.append(`sizes[${idx}][size]`, sizeObj.size);
      formData.append(`sizes[${idx}][quantity]`, sizeObj.quantity);
    });
    if (images && images.length) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update product
  update: async (id, name, category, price, stock, description, images, sizes, details, isActive = true) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', parseFloat(price));
    formData.append('stock', parseInt(stock));
    formData.append('description', description);
    formData.append('details', details || '');
    formData.append('isActive', isActive);
    
    // Send sizes as JSON string to ensure empty array is properly transmitted
    formData.append('sizes', JSON.stringify(sizes || []));
    
    // Separate existing images (URLs) from new images (Files)
    const existingImages = [];
    const newImages = [];
    
    if (images && images.length) {
      images.forEach((image) => {
        if (typeof image === 'string') {
          // Existing image URL from Cloudinary
          existingImages.push(image);
        } else if (image instanceof File) {
          // New image file to upload
          newImages.push(image);
        }
      });
    }
    
    // Send existing images to preserve them
    formData.append('existingImages', JSON.stringify(existingImages));
    
    // Send new image files to upload
    newImages.forEach((file) => {
      formData.append('images', file);
    });
    
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete product
  delete: async (id) => {
    return api.delete(`/products/${id}`);
  },
};
