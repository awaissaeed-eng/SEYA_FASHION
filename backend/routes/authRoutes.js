const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { verifyToken, adminCheck } = require('../middleware/authMiddleware');

// ═══════════════════════════════════════════════════════════════
// CRITICAL SECURITY: Register route is ADMIN-ONLY
// Only logged-in admins can create new admin accounts
// This prevents strangers from creating admin accounts
// ═══════════════════════════════════════════════════════════════
router.post('/register', verifyToken, adminCheck, register);

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', verifyToken, getMe);

module.exports = router;
