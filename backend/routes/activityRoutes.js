const express = require('express');
const router = express.Router();
const { getRecentActivity, getUserActivity } = require('../controllers/activityLogController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getRecentActivity);
router.get('/me', verifyToken, getUserActivity);

module.exports = router;
