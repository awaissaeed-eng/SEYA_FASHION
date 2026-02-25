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

router.get('/', getAllOrders);
router.get('/admin/orders', getAdminOrders);
router.get('/user/my-orders', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrderById);
router.get('/:id/valid-statuses', verifyToken, getValidNextStatuses);
router.post('/', verifyToken, createOrder);
router.put('/:id/status', verifyToken, updateOrderStatus);
router.put('/:id/payment-status', verifyToken, updatePaymentStatus);
router.put('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;
