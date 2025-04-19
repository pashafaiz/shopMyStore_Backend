// const Product = require('../models/Product');
// const User = require('../models/User');
// const { validationResult } = require('express-validator');
// const cloudinary = require('../config/cloudinary');

// // =================== CREATE PRODUCT (POST) ===================
// exports.createProduct = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { name, description, price } = req.body;
//   const image = req.file ? req.file.path : null; // Cloudinary URL
//   const publicId = req.file ? req.file.filename : null; // Cloudinary public ID

//   if (!image || !publicId) {
//     return res.status(400).json({ msg: 'Image is required' });
//   }

//   try {
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     const product = new Product({
//       name,
//       description,
//       price,
//       image,
//       publicId,
//       createdBy: req.user.userId,
//     });

//     await product.save();

//     res.status(201).json({
//       msg: 'Product created successfully',
//       product: {
//         id: product._id,
//         name: product.name,
//         description: product.description,
//         price: product.price,
//         image: product.image,
//         createdBy: product.createdBy,
//         createdAt: product.createdAt,
//         updatedAt: product.updatedAt,
//       },
//     });
//   } catch (err) {
//     console.error('Product creation error:', err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== GET ALL PRODUCTS (GET) ===================
// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find().sort({ createdAt: -1 });

//     res.status(200).json({
//       count: products.length,
//       products: products.map((product) => ({
//         id: product._id,
//         name: product.name,
//         description: product.description,
//         price: product.price,
//         image: product.image,
//         createdBy: product.createdBy,
//         createdAt: product.createdAt,
//         updatedAt: product.updatedAt,
//       })),
//     });
//   } catch (err) {
//     console.error('Get products error:', err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== GET SINGLE PRODUCT (GET) ===================
// exports.getProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     res.status(200).json({
//       product: {
//         id: product._id,
//         name: product.name,
//         description: product.description,
//         price: product.price,
//         image: product.image,
//         createdBy: product.createdBy,
//         createdAt: product.createdAt,
//         updatedAt: product.updatedAt,
//       },
//     });
//   } catch (err) {
//     console.error('Get product error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };


// // =================== UPDATE PRODUCT (PUT) ===================
// exports.updateProduct = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { name, description, price } = req.body;
//   const newImage = req.file ? req.file.path : null;
//   const newPublicId = req.file ? req.file.filename : null;

//   try {
//     let product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     if (product.createdBy.toString() !== req.user.userId) {
//       return res.status(401).json({ msg: 'Not authorized to update this product' });
//     }

//     // Delete old image from Cloudinary if a new one is uploaded
//     if (newImage && product.publicId) {
//       await cloudinary.uploader.destroy(product.publicId);
//     }

//     product.name = name || product.name;
//     product.description = description || product.description;
//     product.price = price || product.price;
//     product.image = newImage || product.image;
//     product.publicId = newPublicId || product.publicId;
//     product.updatedAt = Date.now();

//     await product.save();

//     res.status(200).json({
//       msg: 'Product updated successfully',
//       product: {
//         id: product._id,
//         name: product.name,
//         description: product.description,
//         price: product.price,
//         image: product.image,
//         createdBy: product.createdBy,
//         createdAt: product.createdAt,
//         updatedAt: product.updatedAt,
//       },
//     });
//   } catch (err) {
//     console.error('Update product error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== DELETE PRODUCT (DELETE) ===================
// exports.deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     if (product.createdBy.toString() !== req.user.userId) {
//       return res.status(401).json({ msg: 'Not authorized to delete this product' });
//     }

//     // Delete image from Cloudinary
//     if (product.publicId) {
//       await cloudinary.uploader.destroy(product.publicId);
//     }

//     await Product.deleteOne({ _id: req.params.id });

//     res.status(200).json({ msg: 'Product deleted successfully' });
//   } catch (err) {
//     console.error('Delete product error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== GET RELATED PRODUCTS (GET) ===================
// exports.getRelatedProducts = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     // Simple related products logic (e.g., same creator or similar price range)
//     const relatedProducts = await Product.find({
//       _id: { $ne: req.params.id },
//       $or: [
//         { createdBy: product.createdBy },
//         { price: { $gte: product.price * 0.8, $lte: product.price * 1.2 } },
//       ],
//     })
//       .limit(5)
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       count: relatedProducts.length,
//       products: relatedProducts.map((product) => ({
//         id: product._id,
//         name: product.name,
//         description: product.description,
//         price: product.price,
//         image: product.image,
//         createdBy: product.createdBy,
//         createdAt: product.createdAt,
//         updatedAt: product.updatedAt,
//       })),
//     });
//   } catch (err) {
//     console.error('Get related products error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// module.exports = exports;




// controllers/productController.js
const Product = require('../models/Product');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

// =================== CREATE PRODUCT (POST) ===================
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ msg: 'At least one image or video is required' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Process uploaded files
    const media = files.map((file) => ({
      url: file.path, // Cloudinary URL
      mediaType: file.mimetype.startsWith('video') ? 'video' : 'image',
      publicId: file.filename, // Cloudinary public ID
    }));

    const product = new Product({
      name,
      description,
      price,
      media,
      createdBy: req.user.userId,
    });

    await product.save();

    res.status(201).json({
      msg: 'Product created successfully',
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        media: product.media,
        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET ALL PRODUCTS (GET) ===================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: products.length,
      products: products.map((product) => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        media: product.media,
        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET SINGLE PRODUCT (GET) ===================
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.status(200).json({
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        media: product.media,
        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (err) {
    console.error('Get product error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== UPDATE PRODUCT (PUT) ===================
exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price } = req.body;
  const files = req.files;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (product.createdBy.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized to update this product' });
    }

    // Delete old media from Cloudinary if new files are uploaded
    if (files && files.length > 0 && product.media.length > 0) {
      await Promise.all(
        product.media.map((media) =>
          cloudinary.uploader.destroy(media.publicId, {
            resource_type: media.mediaType,
          })
        )
      );
    }

    // Process new media files
    const newMedia = files && files.length > 0
      ? files.map((file) => ({
          url: file.path,
          mediaType: file.mimetype.startsWith('video') ? 'video' : 'image',
          publicId: file.filename,
        }))
      : product.media; // Keep existing media if no new files

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.media = newMedia;
    product.updatedAt = Date.now();

    await product.save();

    res.status(200).json({
      msg: 'Product updated successfully',
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        media: product.media,
        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (err) {
    console.error('Update product error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== DELETE PRODUCT (DELETE) ===================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (product.createdBy.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized to delete this product' });
    }

    // Delete all media from Cloudinary
    if (product.media.length > 0) {
      await Promise.all(
        product.media.map((media) =>
          cloudinary.uploader.destroy(media.publicId, {
            resource_type: media.mediaType,
          })
        )
      );
    }

    await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET RELATED PRODUCTS (GET) ===================
exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: req.params.id },
      $or: [
        { createdBy: product.createdBy },
        { price: { $gte: product.price * 0.8, $lte: product.price * 1.2 } },
      ],
    })
      .limit(5)
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: relatedProducts.length,
      products: relatedProducts.map((product) => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        media: product.media,
        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
    });
  } catch (err) {
    console.error('Get related products error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = exports;