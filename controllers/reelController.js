// const Reel = require('../models/Reel');
// const User = require('../models/User');
// const cloudinary = require('../config/cloudinary');
// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
// const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
// const { default: mongoose } = require('mongoose');

// ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// ffmpeg.setFfprobePath(ffprobeInstaller.path);

// exports.uploadReel = async (req, res) => {
//   const userId = req.user.userId;
//   const { caption } = req.body;

//   if (!req.file) {
//     return res.status(400).json({ errors: { video: 'Video file is required' } });
//   }

//   const videoUrl = req.file.path; // Cloudinary URL
//   const publicId = req.file.filename; // Cloudinary public ID

//   try {
//     // Validate video duration using Cloudinary metadata
//     const videoInfo = await cloudinary.api.resource(publicId, {
//       resource_type: 'video',
//     });

//     const duration = videoInfo.duration;
//     if (duration > 60) {
//       // Delete the uploaded video if it exceeds duration
//       await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
//       return res.status(400).json({ errors: { video: 'Video must be 1 minute or less' } });
//     }

//     const reel = await Reel.create({
//       videoUrl,
//       publicId,
//       caption,
//       user: userId,
//     });

//     await User.findByIdAndUpdate(userId, {
//       $push: { reels: reel._id }
//     });
    
//     res.status(201).json({ msg: 'Reel uploaded successfully', reel });
//   } catch (err) {
//     console.error('Upload reel error:', err);
//     // Clean up Cloudinary if upload fails
//     if (publicId) {
//       await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
//     }
//     res.status(500).json({ msg: 'Failed to upload reel', error: err.message });
//   }
// };

// exports.getAllReels = async (req, res) => {
//   try {
//     const reels = await Reel.find()
//       .populate('user', 'userName profileImage')
//       .sort({ createdAt: -1 });

//     res.status(200).json({ reels });
//   } catch (err) {
//     console.error('Get reels error:', err);
//     res.status(500).json({ msg: 'Failed to fetch reels', error: err.message });
//   }
// };

// // =================== POST COMMENT (POST) ===================
// exports.postComment = async (req, res) => {
//   const { text } = req.body;
//   const userId = req.user.userId;
//   const reelId = req.params.reelId;

//   if (!text || !text.trim()) {
//     return res.status(400).json({ msg: 'Comment text is required' });
//   }

//   try {
//     const reel = await Reel.findById(reelId);
//     if (!reel) {
//       return res.status(404).json({ msg: 'Reel not found' });
//     }

//     const user = await User.findById(userId).select('userName');
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     // For simplicity, update the reel document to increment comment count
//     reel.comments = (reel.comments || 0) + 1;
//     await reel.save();

//     // In a real app, you'd have a separate Comment model
//     res.status(201).json({
//       msg: 'Comment posted successfully',
//       comment: {
//         _id: new mongoose.Types.ObjectId(),
//         userName: user.userName,
//         text,
//         createdAt: new Date(),
//       },
//     });
//   } catch (err) {
//     console.error('Post comment error:', err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== GET COMMENTS (GET) ===================
// exports.getComments = async (req, res) => {
//   const reelId = req.params.reelId;

//   try {
//     const reel = await Reel.findById(reelId);
//     if (!reel) {
//       return res.status(404).json({ msg: 'Reel not found' });
//     }

//     // Mock comments for simplicity (in a real app, fetch from a Comment model)
//     const mockComments = [
//       {
//         _id: new mongoose.Types.ObjectId(),
//         userName: 'mockUser',
//         text: 'Great reel!',
//         createdAt: new Date(),
//       },
//     ];

//     res.status(200).json({ comments: mockComments });
//   } catch (err) {
//     console.error('Get comments error:', err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// module.exports = exports;





const Reel = require('../models/Reel');
const User = require('../models/User');
const Comment = require('../models/Comment');
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

exports.editReel = async (req, res) => {
  const userId = req.user.userId;
  const reelId = req.params.reelId;
  const { caption } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(reelId)) {
      return res.status(400).json({ msg: 'Invalid reel ID' });
    }

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ msg: 'Reel not found' });
    }

    const reelUserId = reel.user ? reel.user.toString() : 'undefined';
    console.log(`Edit Reel - User ID from JWT: ${userId}`);
    console.log(`Edit Reel - User ID from Reel: ${reelUserId}`);

    if (!reel.user || reelUserId !== userId) {
      return res.status(403).json({ 
        msg: 'Not authorized to edit this reel',
        details: `User ID (${userId}) does not match reel owner (${reelUserId})`
      });
    }
    if (caption !== undefined) {
      reel.caption = caption;
    }

    await reel.save();

    res.status(200).json({ msg: 'Reel updated successfully', reel });
  } catch (err) {
    console.error('Edit reel error:', err);
    res.status(500).json({ msg: 'Failed to edit reel', error: err.message });
  }
};


exports.deleteReel = async (req, res) => {
  const userId = req.user.userId;
  const reelId = req.params.reelId;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ msg: 'Reel not found' });
    }

    if (reel.user.toString() !== userId) {
      return res.status(403).json({ msg: 'Not authorized to delete this reel' });
    }

    // Delete video from Cloudinary
    await cloudinary.uploader.destroy(reel.publicId, { resource_type: 'video' });

    // Delete associated comments
    await Comment.deleteMany({ reel: reelId });

    // Remove reel from user's reels array
    await User.findByIdAndUpdate(userId, {
      $pull: { reels: reelId }
    });

    // Delete the reel
    await Reel.findByIdAndDelete(reelId);

    res.status(200).json({ msg: 'Reel deleted successfully' });
  } catch (err) {
    console.error('Delete reel error:', err);
    res.status(500).json({ msg: 'Failed to delete reel', error: err.message });
  }
};

exports.likeReel = async (req, res) => {
  const userId = req.user.userId;
  const reelId = req.params.reelId;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ msg: 'Reel not found' });
    }

    // Check if user already liked the reel
    if (reel.likes.includes(userId)) {
      return res.status(400).json({ msg: 'Reel already liked' });
    }

    reel.likes.push(userId);
    await reel.save();

    res.status(200).json({ msg: 'Reel liked successfully', likes: reel.likes.length });
  } catch (err) {
    console.error('Like reel error:', err);
    res.status(500).json({ msg: 'Failed to like reel', error: err.message });
  }
};

exports.unlikeReel = async (req, res) => {
  const userId = req.user.userId;
  const reelId = req.params.reelId;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ msg: 'Reel not found' });
    }

    // Check if user hasn't liked the reel
    if (!reel.likes.includes(userId)) {
      return res.status(400).json({ msg: 'Reel not liked' });
    }

    reel.likes = reel.likes.filter(id => id.toString() !== userId);
    await reel.save();

    res.status(200).json({ msg: 'Reel unliked successfully', likes: reel.likes.length });
  } catch (err) {
    console.error('Unlike reel error:', err);
    res.status(500).json({ msg: 'Failed to unlike reel', error: err.message });
  }
};

exports.getLikes = async (req, res) => {
  const reelId = req.params.reelId;

  try {
    const reel = await Reel.findById(reelId).populate('likes', 'userName profileImage');
    if (!reel) {
      return res.status(404).json({ msg: 'Reel not found' });
    }

    res.status(200).json({ likes: reel.likes });
  } catch (err) {
    console.error('Get likes error:', err);
    res.status(500).json({ msg: 'Failed to fetch likes', error: err.message });
  }
};

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

    const user = await User.findById(userId).select('userName profileImage');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const comment = await Comment.create({
      text,
      user: userId,
      reel: reelId
    });

    reel.comments.push(comment._id);
    await reel.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'userName profileImage');

    res.status(201).json({
      msg: 'Comment posted successfully',
      comment: populatedComment
    });
  } catch (err) {
    console.error('Post comment error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getComments = async (req, res) => {
  const reelId = req.params.reelId;

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ msg: 'Reel not found' });
    }

    const comments = await Comment.find({ reel: reelId })
      .populate('user', 'userName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ comments });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  const userId = req.user.userId;
  const commentId = req.params.commentId;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    if (comment.user.toString() !== new mongoose.Types.ObjectId(userId).toString()) {
      return res.status(403).json({ msg: 'Not authorized to delete this comment' });
    }

    await Reel.findByIdAndUpdate(comment.reel, {
      $pull: { comments: commentId }
    });

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ msg: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ msg: 'Failed to delete comment', error: err.message });
  }
};

module.exports = exports;