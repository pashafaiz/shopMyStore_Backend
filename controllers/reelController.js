const Reel = require('../models/Reel');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const { default: mongoose } = require('mongoose');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

exports.uploadReel = async (req, res) => {
  const userId = req.user.userId;
  const { caption } = req.body;

  if (!req.file) {
    return res.status(400).json({ errors: { video: 'Video file is required' } });
  }

  const videoUrl = req.file.path; // Cloudinary URL
  const publicId = req.file.filename; // Cloudinary public ID

  try {
    // Validate video duration using Cloudinary metadata
    const videoInfo = await cloudinary.api.resource(publicId, {
      resource_type: 'video',
    });

    const duration = videoInfo.duration;
    if (duration > 60) {
      // Delete the uploaded video if it exceeds duration
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      return res.status(400).json({ errors: { video: 'Video must be 1 minute or less' } });
    }

    const reel = await Reel.create({
      videoUrl,
      publicId,
      caption,
      user: userId,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { reels: reel._id }
    });
    
    res.status(201).json({ msg: 'Reel uploaded successfully', reel });
  } catch (err) {
    console.error('Upload reel error:', err);
    // Clean up Cloudinary if upload fails
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }
    res.status(500).json({ msg: 'Failed to upload reel', error: err.message });
  }
};

exports.getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate('user', 'userName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ reels });
  } catch (err) {
    console.error('Get reels error:', err);
    res.status(500).json({ msg: 'Failed to fetch reels', error: err.message });
  }
};

// =================== POST COMMENT (POST) ===================
exports.postComment = async (req, res) => {
  const { text } = req.body;
  const userId = req.user.userId;
  const reelId = req.params.reelId;

  if (!text || !text.trim()) {
    return res.status(400).json({ msg: 'Comment text is required' });
  }

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ msg: 'Reel not found' });
    }

    const user = await User.findById(userId).select('userName');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // For simplicity, update the reel document to increment comment count
    reel.comments = (reel.comments || 0) + 1;
    await reel.save();

    // In a real app, you'd have a separate Comment model
    res.status(201).json({
      msg: 'Comment posted successfully',
      comment: {
        _id: new mongoose.Types.ObjectId(),
        userName: user.userName,
        text,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error('Post comment error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET COMMENTS (GET) ===================
exports.getComments = async (req, res) => {
  const reelId = req.params.reelId;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ msg: 'Reel not found' });
    }

    // Mock comments for simplicity (in a real app, fetch from a Comment model)
    const mockComments = [
      {
        _id: new mongoose.Types.ObjectId(),
        userName: 'mockUser',
        text: 'Great reel!',
        createdAt: new Date(),
      },
    ];

    res.status(200).json({ comments: mockComments });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = exports;