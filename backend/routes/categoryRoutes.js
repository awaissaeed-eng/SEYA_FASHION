const express = require('express');
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadCategoryImage } = require('../middleware/uploadMiddleware');

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', verifyToken, uploadCategoryImage.single('image'), createCategory);
router.put('/:id', verifyToken, uploadCategoryImage.single('image'), updateCategory);
router.delete('/:id', verifyToken, deleteCategory);

module.exports = router;
