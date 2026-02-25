const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes (for user frontend)
router.get('/cards', supportController.getSupportCards);
router.get('/faqs', supportController.getFAQs);
router.get('/contact-info', supportController.getContactInfo);
router.get('/whatsapp', supportController.getWhatsAppSettings);
router.get('/policies', supportController.getPolicies);
router.post('/messages', supportController.createContactMessage);

// Admin routes
router.get('/admin/cards', verifyToken, supportController.getAllSupportCards);
router.post('/admin/cards', verifyToken, supportController.createSupportCard);
router.put('/admin/cards/:id', verifyToken, supportController.updateSupportCard);
router.delete('/admin/cards/:id', verifyToken, supportController.deleteSupportCard);

router.get('/admin/faqs', verifyToken, supportController.getAllFAQs);
router.post('/admin/faqs', verifyToken, supportController.createFAQ);
router.put('/admin/faqs/:id', verifyToken, supportController.updateFAQ);
router.delete('/admin/faqs/:id', verifyToken, supportController.deleteFAQ);

router.get('/admin/messages', verifyToken, supportController.getContactMessages);
router.put('/admin/messages/:id/read', verifyToken, supportController.markMessageRead);
router.delete('/admin/messages/:id', verifyToken, supportController.deleteContactMessage);

router.get('/admin/contact-info', verifyToken, supportController.getAllContactInfo);
router.post('/admin/contact-info', verifyToken, supportController.createContactInfo);
router.put('/admin/contact-info/:id', verifyToken, supportController.updateContactInfo);
router.delete('/admin/contact-info/:id', verifyToken, supportController.deleteContactInfo);

router.put('/admin/whatsapp', verifyToken, supportController.updateWhatsAppSettings);

router.get('/admin/policies', verifyToken, supportController.getAllPolicies);
router.post('/admin/policies', verifyToken, supportController.createPolicy);
router.put('/admin/policies/:id', verifyToken, supportController.updatePolicy);
router.delete('/admin/policies/:id', verifyToken, supportController.deletePolicy);

module.exports = router;
