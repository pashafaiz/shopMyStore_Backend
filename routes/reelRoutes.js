// const express = require('express');
// const router = express.Router();
// const { uploadReel, getAllReels } = require('../controllers/reelController');
// const { verifyToken } = require('../middleware/auth');
// const upload = require('../middleware/Upload');

// router.post('/upload-reel', verifyToken, upload.single('video'), uploadReel);
// router.get('/reels', getAllReels);

// module.exports = router;






// routes/reelRoutes.js
const express = require('express');
const router = express.Router();
const { uploadReel, getAllReels, postComment, getComments } = require('../controllers/reelController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/Upload');

router.post('/upload-reel', verifyToken, upload.single('video'), uploadReel);
router.get('/reels', getAllReels);
router.post('/:reelId/comments', verifyToken, postComment);
router.get('/:reelId/comments', getComments);

module.exports = router;

