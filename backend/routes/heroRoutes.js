const express = require('express');
const router = express.Router();
const {
  getHeroSettings,
  updateHeroSettings,
  uploadHeroImages,
  uploadHeroVideo: uploadHeroVideoController,
  deleteHeroImage,
  deleteHeroVideo,
  reorderHeroImages,
} = require('../controllers/heroController');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadHeroImage, uploadHeroVideo: uploadHeroVideoMiddleware } = require('../middleware/uploadMiddleware');

// Public route - get hero settings
router.get('/', getHeroSettings);

// Admin routes
router.put('/settings', verifyToken, updateHeroSettings);
router.post('/images', verifyToken, uploadHeroImage.array('images', 10), uploadHeroImages);
router.post('/video', verifyToken, uploadHeroVideoMiddleware.single('video'), uploadHeroVideoController);
router.delete('/image', verifyToken, deleteHeroImage);
router.delete('/video', verifyToken, deleteHeroVideo);
router.put('/reorder', verifyToken, reorderHeroImages);

module.exports = router;
