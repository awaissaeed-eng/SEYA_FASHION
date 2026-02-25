const express = require('express');
const router = express.Router();
const { getTaxSettings, updateTaxSettings, getTaxCalculation } = require('../controllers/taxController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/settings', getTaxSettings);
router.get('/calculate', getTaxCalculation);

// Admin only routes
router.put('/settings', verifyToken, updateTaxSettings);

module.exports = router;