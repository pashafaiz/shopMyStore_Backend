const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const upload = require('../middleware/Upload');

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

router.post(
  '/',
  authController.verifyToken,
  upload.array('media', 10),
  productValidation,
  productController.createProduct
);
router.get('/', productController.getAllProducts);
router.get('/cart', authController.verifyToken, productController.getCart);
router.get('/wishlist', authController.verifyToken, productController.getWishlist);
router.get('/:id', productController.getProduct);
router.put('/:id',authController.verifyToken,upload.array('media', 10),productValidation,productController.updateProduct);
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

module.exports = router;