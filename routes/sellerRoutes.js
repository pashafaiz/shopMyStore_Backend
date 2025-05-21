const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/seller/profileController');
const sellerProductController = require('../controllers/seller/productController');
const sellerAnalyticsController = require('../controllers/seller/analyticsController');
const sellerOrderController = require('../controllers/seller/orderController');
const sellerChatController = require('../controllers/seller/chatController');
const authController = require('../controllers/authController');
const upload = require('../middleware/Upload');

// Seller Profile Routes
router.post('/profile', 
  authController.verifyToken, 
  upload.fields([
    { name: 'businessLogo', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
  ]), 
  sellerController.updateSellerProfile
);

router.get('/profile', 
  authController.verifyToken, 
  sellerController.getSellerProfile
);

router.get('/profile/:sellerId', 
  sellerController.getSellerPublicProfile
);

// Seller Product Routes
router.get('/products', 
  authController.verifyToken, 
  sellerProductController.getSellerProducts
);

router.get('/products/analytics', 
  authController.verifyToken, 
  sellerProductController.getProductAnalytics
);

// Seller Analytics Routes
router.get('/analytics/sales', 
  authController.verifyToken, 
  sellerAnalyticsController.getSalesAnalytics
);

router.get('/analytics/dashboard', 
  authController.verifyToken, 
  sellerAnalyticsController.getDashboardSummary
);

// Seller Order Routes
router.get('/orders', 
  authController.verifyToken, 
  sellerOrderController.getSellerOrders
);

router.put('/orders/:orderId/status', 
  authController.verifyToken, 
  sellerOrderController.updateOrderStatus
);

router.get('/orders/:orderId', 
  authController.verifyToken, 
  sellerOrderController.getOrderDetails
);

// Seller Chat Routes
router.get('/chats', 
  authController.verifyToken, 
  sellerChatController.getSellerChats
);

router.get('/chats/:chatId', 
  authController.verifyToken, 
  sellerChatController.getChatMessages
);

router.post('/chats/:chatId/messages', 
  authController.verifyToken, 
  sellerChatController.sendMessage
);

module.exports = router;