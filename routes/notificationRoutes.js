const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.post('/', notificationController.createNotification);
router.get('/', verifyToken, notificationController.getNotifications);
router.put('/:notificationId/read', verifyToken, notificationController.markAsRead);
router.delete('/:notificationId', verifyToken, notificationController.deleteNotification);
router.delete('/', verifyToken, notificationController.clearNotifications);
router.post('/save-fcm-token', verifyToken, notificationController.saveFcmToken);

module.exports = router;