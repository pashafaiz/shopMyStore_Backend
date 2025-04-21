
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
  upload.array('media', 5), // Changed to support multiple media
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