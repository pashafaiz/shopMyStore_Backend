// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const { verifyToken } = require('../middleware/auth');

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);
// router.post('/send-otp', authController.sendOtp);
// router.post('/verify-otp', authController.verifyOtp);
// router.post('/resend-otp', authController.resendOtp);
// router.put('/edit-profile', verifyToken, authController.editProfile);
// router.get('/user/:id', verifyToken, authController.getCompleteUserProfile);


// module.exports = router;




const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.put('/edit-profile', verifyToken, authController.editProfile);
router.get('/user/:id', verifyToken, authController.getCompleteUserProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-password-reset-otp', authController.verifyPasswordResetOtp);
router.post('/reset-password', authController.resetPassword);

module.exports = router;