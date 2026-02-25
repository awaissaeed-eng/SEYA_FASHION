const express = require('express');
const router = express.Router();
const {
  getAllFooterLinks,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
  getFloatingSocialIcons
} = require('../controllers/footerLinkController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', getAllFooterLinks);
router.get('/floating', getFloatingSocialIcons); // Public endpoint for frontend
router.post('/', verifyToken, createFooterLink);
router.put('/:id', verifyToken, updateFooterLink);
router.delete('/:id', verifyToken, deleteFooterLink);

module.exports = router;
