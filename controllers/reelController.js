// const Reel = require('../models/Reel');
// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
// const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
// const path = require('path');

// ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// ffmpeg.setFfprobePath(ffprobeInstaller.path); 


// exports.uploadReel = async (req, res) => {
//     const userId = req.user.userId;
//     const { caption } = req.body;
  
//     if (!req.file) {
//       return res.status(400).json({ errors: { video: 'Video file is required' } });
//     }
  
//     const filePath = path.resolve(req.file.path).replace(/\\/g, '/');
  
//     try {
//       console.log('FFMPEG PATH:', ffmpegInstaller.path);
//       console.log('File path:', filePath);
  
//       ffmpeg.ffprobe(filePath, async (err, metadata) => {
//         if (err) {
//           console.error('FFprobe error:', err);
//           return res.status(500).json({ msg: 'Error processing video', error: err.message });
//         }
  
//         const duration = metadata.format.duration;
//         if (duration > 60) {
//           return res.status(400).json({ errors: { video: 'Video must be 1 minute or less' } });
//         }
  
//         const relativePath = path.relative(path.join(__dirname, '../uploads'), filePath).replace(/\\/g, '/');
//         const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
//         const videoUrl = `${baseUrl}/uploads/${relativePath}`;
  
//         const reel = await Reel.create({
//           videoUrl,
//           caption,
//           user: userId,
//         });
  
//         res.status(201).json({ msg: 'Reel uploaded successfully', reel });
//       });
//     } catch (err) {
//       console.error('Upload reel error:', err);
//       res.status(500).json({ msg: 'Failed to upload reel', error: err.message });
//     }
//   };
  

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



const Reel = require('../models/Reel');
const path = require('path');
const fs = require('fs');

exports.uploadReel = async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Request File:', req.file);
  const userId = req.user.userId;
  const { caption } = req.body;

  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ errors: { video: 'Video file is required' } });
  }

  const filePath = path.resolve(req.file.path).replace(/\\/g, '/');

  try {
    // Skip FFmpeg to avoid resource issues on Render free tier
    const relativePath = path.relative(path.join(__dirname, '../Uploads'), filePath).replace(/\\/g, '/');
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const videoUrl = `${baseUrl}/Uploads/${relativePath}`;

    const reel = await Reel.create({
      videoUrl,
      caption,
      user: userId,
    });

    res.status(201).json({ msg: 'Reel uploaded successfully', reel });
  } catch (err) {
    console.error('Upload Reel Error:', {
      message: err.message,
      stack: err.stack,
    });
    // Cleanup file on error
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error('File Cleanup Error:', unlinkErr);
    });
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
    console.error('Get Reels Error:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ msg: 'Failed to fetch reels', error: err.message });
  }
};