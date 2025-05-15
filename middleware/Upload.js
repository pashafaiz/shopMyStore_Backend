const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    return {
      folder: isVideo ? 'product_videos' : 'product_images',
      resource_type: isVideo ? 'video' : 'image',
      public_id: `shopmystore_${Date.now()}_${file.originalname}`,
      // No quality transformations to preserve original quality
      transformation: isVideo ? [] : [{ fetch_format: 'auto' }], // Only format optimization for images
    };
  },
});

const fileFilter = (req, file, cb) => {
  // Allow any image or video MIME type supported by Cloudinary
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const Upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB per file to support high-quality media
    files: 10, // Max 10 files
  },
});

module.exports = Upload;