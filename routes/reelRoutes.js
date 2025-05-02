const express = require('express');
const router = express.Router();
const { 
  uploadReel, 
  getAllReels, 
  editReel,
  deleteReel,
  likeReel,
  unlikeReel,
  getLikes,
  postComment, 
  getComments, 
  deleteComment
} = require('../controllers/reelController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/Upload');

router.post('/upload-reel', verifyToken, upload.single('video'), uploadReel);
router.get('/reels', getAllReels);
router.put('/:reelId', verifyToken, editReel);
router.delete('/:reelId', verifyToken, deleteReel);
router.post('/:reelId/like', verifyToken, likeReel);
router.post('/:reelId/unlike', verifyToken, unlikeReel);
router.get('/:reelId/likes', getLikes);
router.post('/:reelId/comments', verifyToken, postComment);
router.get('/:reelId/comments', getComments);
router.delete('/comments/:commentId', verifyToken, deleteComment);


module.exports = router;