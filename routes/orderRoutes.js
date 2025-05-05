const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, orderController.getOrders);
router.get('/products/:id', orderController.getProductDetails);
router.get('/addresses', verifyToken, orderController.getAddresses);
router.post('/addresses', verifyToken, orderController.addAddress);
router.delete('/addresses/:id', verifyToken, orderController.deleteAddress);
router.post('/promo-codes/validate', verifyToken, orderController.validatePromoCode);
router.post('/', verifyToken, orderController.placeOrder);

module.exports = router;