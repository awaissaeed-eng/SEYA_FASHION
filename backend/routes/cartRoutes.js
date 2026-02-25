const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { uploadMeasurementFiles } = require('../middleware/uploadMiddleware');

// All cart routes are now guest-only (no authentication required)
router.get('/', getCart);
router.post('/add', uploadMeasurementFiles.array('measurementFiles', 5), addToCart);
router.put('/update', updateCartItem);
router.delete('/remove', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
