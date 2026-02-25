const express = require('express');
const router = express.Router();
const {
  subscribe,
  getAllSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
  sendNotification,
  getStats,
  getEmailLogs,
  getEmailConfig,
  testEmailConfig,
} = require('../controllers/subscriberController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route - subscribe
router.post('/subscribe', subscribe);

// Admin routes
router.get('/', verifyToken, getAllSubscribers);
router.get('/stats', verifyToken, getStats);
router.get('/email-logs', verifyToken, getEmailLogs);
router.get('/email-config', verifyToken, getEmailConfig);
router.get('/test-email', verifyToken, testEmailConfig);
router.put('/:id/status', verifyToken, updateSubscriberStatus);
router.delete('/:id', verifyToken, deleteSubscriber);
router.post('/notify', verifyToken, sendNotification);

module.exports = router;
