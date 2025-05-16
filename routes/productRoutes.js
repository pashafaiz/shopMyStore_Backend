// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');
// const authController = require('../controllers/authController');
// const { check } = require('express-validator');
// const upload = require('../middleware/Upload');

// // Validation rules
// const productValidation = [
//   check('name', 'Name is required').not().isEmpty(),
//   check('description', 'Description is required').not().isEmpty(),
//   check('price', 'Price must be a positive number').isFloat({ min: 0 }),
//   check('category', 'Category is required').not().isEmpty(),
//   check('stock', 'Stock must be a non-negative number').isInt({ min: 0 }),
//   check('brand', 'Brand is required').not().isEmpty(),
// ];

// const reviewValidation = [
//   check('productId', 'Product ID is required').not().isEmpty(),
//   check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
//   check('comment', 'Comment is required').not().isEmpty(),
// ];

// // @route   POST api/products
// // @desc    Create a product
// // @access  Private
// router.post(
//   '/',
//   authController.verifyToken,
//   upload.array('media', 10), // Increased to 10
//   productValidation,
//   productController.createProduct
// );

// // @route   GET api/products
// // @desc    Get all products
// // @access  Public
// router.get('/', productController.getAllProducts);

// // @route   GET api/products/cart
// // @desc    Get user's cart
// // @access  Private
// router.get('/cart', authController.verifyToken, productController.getCart);

// // @route   GET api/products/wishlist
// // @desc    Get user's wishlist
// // @access  Private
// router.get('/wishlist', authController.verifyToken, productController.getWishlist);

// // @route   GET api/products/:id
// // @desc    Get single product
// // @access  Public
// router.get('/:id', productController.getProduct);

// // @route   PUT api/products/:id
// // @desc    Update a product
// // @access  Private
// router.put(
//   '/:id',
//   authController.verifyToken,
//   upload.array('media', 10), // Increased to 10
//   productValidation,
//   productController.updateProduct
// );

// // @route   DELETE api/products/:id
// // @desc    Delete a product
// // @access  Private
// router.delete('/:id', authController.verifyToken, productController.deleteProduct);

// // @route   GET api/products/:id/related
// // @desc    Get related products
// // @access  Public
// router.get('/:id/related', productController.getRelatedProducts);

// // @route   GET api/products/category/:category
// // @desc    Get products by category
// // @access  Public
// router.get('/category/:category', productController.getProductsByCategory);

// // @route   POST api/products/cart/:productId
// // @desc    Add product to cart
// // @access  Private
// router.post('/cart/:productId', authController.verifyToken, productController.addToCart);

// // @route   DELETE api/products/cart/:productId
// // @desc    Remove product from cart
// // @access  Private
// router.delete('/cart/:productId', authController.verifyToken, productController.removeFromCart);

// // @route   POST api/products/wishlist/:productId
// // @desc    Toggle product in wishlist
// // @access  Private
// router.post('/wishlist/:productId', authController.verifyToken, productController.toggleWishlist);

// // @route   DELETE api/products/wishlist/:productId
// // @desc    Remove product from wishlist
// // @access  Private
// router.delete('/wishlist/:productId', authController.verifyToken, productController.removeFromWishlist);

// // @route   POST api/products/reviews
// // @desc    Create a review
// // @access  Private
// router.post('/reviews', authController.verifyToken, reviewValidation, productController.createReview);

// // @route   GET api/products/reviews/:productId
// // @desc    Get product reviews
// // @access  Public
// router.get('/reviews/:productId', productController.getProductReviews);

// // @route   DELETE api/products/reviews/:reviewId
// // @desc    Delete a review
// // @access  Private
// router.delete('/reviews/:reviewId', authController.verifyToken, productController.deleteReview);

// module.exports = router;








const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const upload = require('../middleware/Upload');

// Validation rules
const productValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('price', 'Price must be a positive number').isFloat({ min: 0 }),
  check('category', 'Category is required').not().isEmpty(),
  check('stock', 'Stock must be a non-negative number').isInt({ min: 0 }),
  check('brand', 'Brand is required').not().isEmpty(),
];

const reviewValidation = [
  check('productId', 'Product ID is required').not().isEmpty(),
  check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
  check('comment', 'Comment is required').not().isEmpty(),
];

const orderStatusValidation = [
  check('status', 'Status is required').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
];

const trackingValidation = [
  check('trackingId', 'Tracking ID is required').optional().not().isEmpty(),
  check('carrier', 'Carrier is required').optional().not().isEmpty(),
  check('status', 'Status is required').optional().isIn(['not_shipped', 'in_transit', 'out_for_delivery', 'delivered']),
  check('location', 'Location is required').optional().not().isEmpty(),
];

const profileValidation = [
  check('fullName', 'Full name is required').optional().not().isEmpty(),
  check('userName', 'Username is required').optional().not().isEmpty(),
  check('email', 'Valid email is required').optional().isEmail(),
  check('phoneNumber', 'Valid phone number is required').optional().isMobilePhone(),
];

const promoValidation = [
  check('code', 'Promo code is required').not().isEmpty(),
  check('discount', 'Discount must be between 0 and 100').isInt({ min: 0, max: 100 }),
  check('validFrom', 'Valid from date is required').isISO8601(),
  check('validUntil', 'Valid until date is required').isISO8601(),
  check('maxUses', 'Max uses must be a non-negative number').optional().isInt({ min: 0 }),
];

const supportTicketValidation = [
  check('customerId', 'Customer ID is required').not().isEmpty(),
  check('subject', 'Subject is required').not().isEmpty(),
  check('message', 'Message is required').not().isEmpty(),
];

const returnValidation = [
  check('status', 'Status is required').isIn(['requested', 'approved', 'rejected']),
  check('reason', 'Reason is required').optional().not().isEmpty(),
];

const refundValidation = [
  check('status', 'Status is required').isIn(['initiated', 'completed', 'failed']),
];

const stockValidation = [
  check('products', 'Products array is required').isArray({ min: 1 }),
  check('products.*.productId', 'Product ID is required').not().isEmpty(),
  check('products.*.stock', 'Stock must be a non-negative number').isInt({ min: 0 }),
];

// Existing routes
router.post('/', authController.verifyToken, upload.array('media', 10), productValidation, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/cart', authController.verifyToken, productController.getCart);
router.get('/wishlist', authController.verifyToken, productController.getWishlist);
router.get('/:id', productController.getProduct);
router.put('/:id', authController.verifyToken, upload.array('media', 10), productValidation, productController.updateProduct);
router.delete('/:id', authController.verifyToken, productController.deleteProduct);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.post('/cart/:productId', authController.verifyToken, productController.addToCart);
router.delete('/cart/:productId', authController.verifyToken, productController.removeFromCart);
router.post('/wishlist/:productId', authController.verifyToken, productController.toggleWishlist);
router.delete('/wishlist/:productId', authController.verifyToken, productController.removeFromWishlist);
router.post('/reviews', authController.verifyToken, reviewValidation, productController.createReview);
router.get('/reviews/:productId', productController.getProductReviews);
router.delete('/reviews/:reviewId', authController.verifyToken, productController.deleteReview);

// Seller routes
router.get('/seller/dashboard', authController.verifyToken, productController.getSellerDashboard);
router.get('/seller/orders', authController.verifyToken, productController.getSellerOrders);
router.put('/seller/orders/:orderId/status', authController.verifyToken, orderStatusValidation, productController.updateOrderStatus);
router.put('/seller/orders/:orderId/tracking', authController.verifyToken, trackingValidation, productController.updateOrderTracking);
router.put('/seller/orders/:orderId/cancel', authController.verifyToken, [check('reason', 'Reason is required').not().isEmpty()], productController.cancelOrder);
router.get('/seller/low-stock', authController.verifyToken, productController.getLowStockAlerts);
router.post('/seller/promo', authController.verifyToken, promoValidation, productController.createPromoCode);
router.delete('/seller/promo/:promoId', authController.verifyToken, productController.deletePromoCode);
router.get('/seller/notifications', authController.verifyToken, productController.getSellerNotifications);
router.put('/seller/notifications/:notificationId', authController.verifyToken, productController.markNotificationRead);
router.post('/seller/support', authController.verifyToken, supportTicketValidation, productController.handleSupportTicket);
router.put('/seller/support/:ticketId', authController.verifyToken, [check('status', 'Status is required').isIn(['open', 'in_progress', 'closed'])], productController.updateSupportTicketStatus);
router.put('/seller/orders/:orderId/return', authController.verifyToken, returnValidation, productController.handleReturnRequest);
router.put('/seller/orders/:orderId/refund', authController.verifyToken, refundValidation, productController.processRefund);
router.get('/seller/profile', authController.verifyToken, productController.getSellerProfile);
router.put('/seller/profile', authController.verifyToken, upload.single('profilePicture'), profileValidation, productController.updateSellerProfile);
router.get('/seller/analytics', authController.verifyToken, productController.getSellerAnalytics);
router.put('/seller/stock', authController.verifyToken, stockValidation, productController.bulkUpdateStock);

module.exports = router;