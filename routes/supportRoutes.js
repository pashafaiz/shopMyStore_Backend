const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { verifyToken } = require('../middleware/auth');

router.post('/submit-ticket', verifyToken, supportController.submitTicket);
router.get('/faqs', supportController.getFAQs);
router.post('/chat/messages', verifyToken, supportController.sendChatMessage);
router.get('/chat/messages', verifyToken, supportController.getChatMessages);

module.exports = router;