import api from '../config/api';

export const orderService = {
  async getUserOrders() {
    return api.get('/orders/user/my-orders');
  },
  async getOrderById(id, queryParams = '') {
    const url = queryParams ? `/orders/${id}?${queryParams}` : `/orders/${id}`;
    return api.get(url);
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
