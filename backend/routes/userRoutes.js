const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addToWishlist,
  removeFromWishlist,
  updateAdminProfile,
  changePassword,
  uploadAvatar,
} = require('../controllers/userController');
const { verifyToken, adminCheck, validateObjectId } = require('../middleware/authMiddleware');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/uploadMiddleware');

// Admin profile routes (must be before :id routes)
router.put('/admin/profile', verifyToken, adminCheck, uploadAvatarMiddleware.single('avatar'), updateAdminProfile);
router.put('/admin/password', verifyToken, adminCheck, changePassword);
router.post('/admin/avatar', verifyToken, adminCheck, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

// Wishlist routes (require authentication)
router.post('/wishlist/add', verifyToken, addToWishlist);
router.post('/wishlist/remove', verifyToken, removeFromWishlist);

// Admin-only user management routes
router.get('/', verifyToken, adminCheck, getAllUsers);
router.get('/:id', verifyToken, adminCheck, validateObjectId, getUserById);
router.put('/:id', verifyToken, adminCheck, validateObjectId, updateUser);
router.delete('/:id', verifyToken, adminCheck, validateObjectId, deleteUser);

module.exports = router;
