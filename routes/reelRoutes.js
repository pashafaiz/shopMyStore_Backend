const express = require('express');
const router = express.Router();
const { uploadReel, getAllReels } = require('../controllers/reelController');
const { verifyToken } = require('../middleware/auth');

router.post('/upload-reel', verifyToken, uploadReel);
router.get('/reels', getAllReels);

module.exports = router;
