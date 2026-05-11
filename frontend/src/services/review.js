import api from '../config/api';

export const reviewService = {
  // PUBLIC - Submit a review
  async createReview(reviewData) {
    return api.post('/reviews', reviewData);
  },

  // PUBLIC - Get approved reviews for a product
  async getProductReviews(productId) {
    return api.get(`/reviews/product/${productId}`);
  },

  // ADMIN - Get all reviews (with optional status filter)
  async getAllReviews(status = 'all') {
    return api.get(`/reviews?status=${status}`);
  },

  // ADMIN - Get review statistics
  async getReviewStats() {
    return api.get('/reviews/stats');
  },

  // ADMIN - Approve a review
  async approveReview(reviewId) {
    return api.put(`/reviews/${reviewId}/approve`);
  },

  // ADMIN - Delete a review
  async deleteReview(reviewId) {
    return api.delete(`/reviews/${reviewId}`);
  },
};

export default reviewService;
