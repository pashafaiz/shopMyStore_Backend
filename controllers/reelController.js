const Reel = require('../models/Reel');

exports.uploadReel = async (req, res) => {
  const { videoUrl, caption } = req.body;
  const userId = req.user.userId;

  if (!videoUrl) {
    return res.status(400).json({ errors: { videoUrl: 'Video URL is required' } });
  }

  try {
    const reel = await Reel.create({
      videoUrl,
      caption,
      user: userId
    });

    res.status(201).json({ msg: 'Reel uploaded successfully', reel });
  } catch (err) {
    console.error('Upload reel error:', err);
    res.status(500).json({ msg: 'Failed to upload reel', error: err.message });
  }
};


exports.getAllReels = async (req, res) => {
    try {
      const reels = await Reel.find()
        .populate('user', 'userName profileImage') // add profileImage if needed
        .sort({ createdAt: -1 });
  
      res.status(200).json({ reels });
    } catch (err) {
      console.error('Get reels error:', err);
      res.status(500).json({ msg: 'Failed to fetch reels', error: err.message });
    }
  };
  