const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getAllReviews,
  approveReview,
  deleteReview,
  getReviewStats,
} = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════

// Submit a review (PUBLIC - no authentication required)
router.post('/', createReview);

// Get approved reviews for a specific product (PUBLIC)
router.get('/product/:productId', getProductReviews);

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES (Protected)
// ═══════════════════════════════════════════════════════════════

// Get all reviews including pending (ADMIN)
router.get('/', verifyToken, getAllReviews);

// Get review statistics (ADMIN)
router.get('/stats', verifyToken, getReviewStats);

// Approve a review (ADMIN)
router.put('/:id/approve', verifyToken, approveReview);

// Delete a review (ADMIN)
router.delete('/:id', verifyToken, deleteReview);

module.exports = router;
