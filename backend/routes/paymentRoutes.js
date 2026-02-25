const express = require('express');
const router = express.Router();
const {
  // New secure payment endpoints
  initiatePayment,
  verifyPayment,
  getPaymentStatus
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later.'
  }
});

// New secure payment endpoints
// Payment initiation (requires authentication)
router.post('/initiate', paymentRateLimit, verifyToken, initiatePayment);

// Payment verification (webhook endpoint - no auth required)
router.post('/verify/:transactionId', verifyPayment);

// Get payment status (requires authentication)
router.get('/status/:transactionId', verifyToken, getPaymentStatus);

module.exports = router;
