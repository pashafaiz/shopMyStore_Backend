
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
// ];

// router.get('/category/:category', productController.getProductsByCategory);


// // @route   POST api/products
// // @desc    Create a product
// // @access  Private
// router.post(
//   '/',
//   authController.verifyToken,
//   upload.array('media', 5),
//   productValidation,
//   productController.createProduct
// );

// // @route   GET api/products
// // @desc    Get all products
// // @access  Public
// router.get('/', productController.getAllProducts);

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
//   upload.array('media', 5), // Changed to support multiple media
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
];

const cartValidation = [
  check('productId', 'Product ID is required').not().isEmpty(),
];

// @route   POST api/products/cart
// @desc    Add product to cart
// @access  Private
router.post(
  '/cart/:productId',  // Changed from '/cart'
  authController.verifyToken,
  productController.addToCart
);

// @route   GET api/products/cart
// @desc    Get user's cart
// @access  Private
router.get(
  '/cart',
  authController.verifyToken,
  productController.getCart
);

// @route   DELETE api/products/cart/:productId
// @desc    Remove product from cart
// @access  Private
router.delete(
  '/cart/:productId',
  authController.verifyToken,
  productController.removeFromCart
);

// @route   POST api/products/wishlist/:productId
// @desc    Toggle product in wishlist
// @access  Private
router.post(
  '/wishlist/:productId',
  authController.verifyToken,
  productController.toggleWishlist
);

// @route   GET api/products/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get(
  '/wishlist',
  authController.verifyToken,
  productController.getWishlist
);

// @route   DELETE api/products/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete(
  '/wishlist/:productId',
  authController.verifyToken,
  productController.removeFromWishlist
);

// @route   GET api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', productController.getProductsByCategory);

// @route   POST api/products
// @desc    Create a product
// @access  Private
router.post(
  '/',
  authController.verifyToken,
  upload.array('media', 5),
  productValidation,
  productController.createProduct
);

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', productController.getAllProducts);

// @route   GET api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', productController.getProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private
router.put(
  '/:id',
  authController.verifyToken,
  upload.array('media', 5),
  productValidation,
  productController.updateProduct
);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', authController.verifyToken, productController.deleteProduct);

// @route   GET api/products/:id/related
// @desc    Get related products
// @access  Public
router.get('/:id/related', productController.getRelatedProducts);

module.exports = router;