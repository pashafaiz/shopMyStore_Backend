const express = require('express');
const router = express.Router();
const promoCodeController = require('../controllers/promoCodeController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, promoCodeController.createPromoCode);

module.exports = router;