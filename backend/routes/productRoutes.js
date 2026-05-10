const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getFeaturedProducts,
} = require('../controllers/productController');
const { verifyToken, adminCheck, validateObjectId } = require('../middleware/authMiddleware');
const { uploadProductImage } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', validateObjectId, getProductById);

// Admin routes (require authentication)
router.get('/admin/all', verifyToken, adminCheck, getAllProductsAdmin);
router.post('/', verifyToken, adminCheck, uploadProductImage.array('images', 10), createProduct);
router.put('/:id', verifyToken, adminCheck, validateObjectId, uploadProductImage.array('images', 10), updateProduct);
router.delete('/:id', verifyToken, adminCheck, validateObjectId, deleteProduct);

// User routes (require authentication)
router.post('/:id/review', verifyToken, validateObjectId, addReview);

module.exports = router;
