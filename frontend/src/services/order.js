import api from '../config/api';

export const orderService = {
  async getUserOrders() {
    return api.get('/orders/user/my-orders');
  },
  async getOrderById(id) {
    return api.get(`/orders/${id}`);
  },
  async createOrder(orderData) {
    return api.post('/orders', orderData);
  },
  async getAllOrders() {
    return api.get('/orders/admin/orders');
  },
  async updateOrderStatus(orderId, status) {
    return api.put(`/orders/${orderId}/status`, { status });
  },
  async getValidNextStatuses(orderId) {
    return api.get(`/orders/${orderId}/valid-statuses`);
  },
};
