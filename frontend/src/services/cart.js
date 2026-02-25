import api from '../config/api';

export const cartService = {
  async addToCart(item) {
    return api.post('/cart/add', item);
  },
  
  async getCart() {
    return api.get('/cart');
  },
  
  async updateCartItem(item) {
    return api.put('/cart/update', item);
  },
  
  async removeCartItem(item) {
    return api.delete('/cart/remove', { data: item });
  },
  
  async clearCart() {
    return api.delete('/cart/clear');
  },
};
