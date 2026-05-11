const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getAdminOrders,
  getValidNextStatuses,
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes - no authentication
router.post('/', createOrder); // Create order - 100% public
router.get('/:id', getOrderById); // View order - 100% public
router.put('/:id/cancel', cancelOrder); // Cancel order - 100% public

// Admin routes - require authentication
router.get('/', getAllOrders);
router.get('/admin/orders', getAdminOrders);
router.get('/user/my-orders', verifyToken, getUserOrders);
router.get('/:id/valid-statuses', verifyToken, getValidNextStatuses);
router.put('/:id/status', verifyToken, updateOrderStatus);
router.put('/:id/payment-status', verifyToken, updatePaymentStatus);

module.exports = router;
