const express = require('express');
const router = express.Router();
const {
  // New secure payment endpoints
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
  handleWebhook
} = require('../controllers/paymentController');
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

// Payment endpoints - 100% public, no authentication
router.post('/initiate', paymentRateLimit, initiatePayment);
router.post('/verify/:transactionId', verifyPayment);
router.get('/status/:transactionId', getPaymentStatus);

// Webhook from Meezan Bank - no auth, signature verified inside
router.post('/webhook', handleWebhook);

module.exports = router;
