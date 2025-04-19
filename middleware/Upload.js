// const multer = require('multer');
// const cloudinary = require('../config/cloudinary');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     const isVideo = file.mimetype.startsWith('video');
//     return {
//       folder: isVideo ? 'reels' : 'products',
//       resource_type: isVideo ? 'video' : 'image',
//       public_id: `shopmystore_${Date.now()}_${file.originalname}`,
//     };
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'video/x-matroska'];
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only images and videos are allowed!'), false);
//   }
// };

// const Upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 60 * 1024 * 1024, // 60MB
//   },
// });

// module.exports = Upload;






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
      public_id: `shopmystore_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`,
      transformation: isVideo
        ? [{ quality: 'auto:best', fetch_format: 'mp4', video_codec: 'h264' }]
        : [{ quality: 'auto', fetch_format: 'auto' }],
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/quicktime',
    'video/x-matroska',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, MP4, MOV, and MKV files are allowed!'), false);
  }
};

const Upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB
    files: 5, // Max 5 files
  },
});

module.exports = Upload;