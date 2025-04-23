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

//   const { name, description, price, category } = req.body;
//   const files = req.files;

//   if (!files || files.length === 0) {
//     return res.status(400).json({ msg: 'At least one image or video is required' });
//   }

//   try {
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     const media = files.map((file) => ({
//       url: file.path,
//       mediaType: file.mimetype.startsWith('video') ? 'video' : 'image',
//       publicId: file.filename,
//     }));

//     const product = new Product({
//       name,
//       description,
//       price,
//       category: category || 'general',
//       media,
//       createdBy: req.user.userId,
//     });
//     user.products.push(product._id);
//     await product.save();

//     res.status(201).json({
//       msg: 'Product created successfully',
//       product
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
//         media: product.media,
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
//         media: product.media,
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

//   const { name, description, price, category } = req.body;
//   const files = req.files;

//   try {
//     let product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     if (product.createdBy.toString() !== req.user.userId) {
//       return res.status(401).json({ msg: 'Not authorized to update this product' });
//     }

//     if (files && files.length > 0 && product.media.length > 0) {
//       await Promise.all(
//         product.media.map((media) =>
//           cloudinary.uploader.destroy(media.publicId, {
//             resource_type: media.mediaType,
//           })
//         )
//       );
//     }

//     const newMedia = files && files.length > 0
//       ? files.map((file) => ({
//           url: file.path,
//           mediaType: file.mimetype.startsWith('video') ? 'video' : 'image',
//           publicId: file.filename,
//         }))
//       : product.media;

//     product.name = name || product.name;
//     product.description = description || product.description;
//     product.price = price || product.price;
//     product.category = category || product.category;
//     product.media = newMedia;
//     product.updatedAt = Date.now();

//     await product.save();

//     res.status(200).json({
//       msg: 'Product updated successfully',
//       product
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
      
//     await User.findByIdAndUpdate(product.createdBy, {
//       $pull: { products: product._id }
//     });
    
//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     if (product.createdBy.toString() !== req.user.userId) {
//       return res.status(401).json({ msg: 'Not authorized to delete this product' });
//     }

//     // Delete all media from Cloudinary
//     if (product.media.length > 0) {
//       await Promise.all(
//         product.media.map((media) =>
//           cloudinary.uploader.destroy(media.publicId, {
//             resource_type: media.mediaType,
//           })
//         )
//       );
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

//     const relatedProducts = await Product.find({
//       _id: { $ne: req.params.id },
//       $or: [
//         { createdBy: product.createdBy },
//         { category: product.category },
//         { price: { $gte: product.price * 0.8, $lte: product.price * 1.2 } },
//       ],
//     })
//       .limit(5)
//       .sort({ createdAt: -1 })
//       .populate('createdBy', 'name email');

//     res.status(200).json({
//       count: relatedProducts.length,
//       products: relatedProducts
//     });
//   } catch (err) {
//     console.error('Get related products error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };


// exports.getProductsByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;
    
//     if (!category) {
//       return res.status(400).json({ msg: 'Category is required' });
//     }

//     if (category === 'all') {
//       const products = await Product.find().populate('createdBy', 'name email');
//       return res.json({ products });
//     }

//     const products = await Product.find({ category }).populate('createdBy', 'name email');
    
//     res.json({ products });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// };

// module.exports = exports;









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

  const { name, description, price, category } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ msg: 'At least one image or video is required' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const media = files.map((file) => ({
      url: file.path,
      mediaType: file.mimetype.startsWith('video') ? 'video' : 'image',
      publicId: file.filename,
    }));

    const product = new Product({
      name,
      description,
      price,
      category: category || 'general',
      media,
      createdBy: req.user.userId,
    });
    user.products.push(product._id);
    await user.save();
    await product.save();

    res.status(201).json({
      msg: 'Product created successfully',
      product,
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
    console.log('Get all products:', { count: products.length, products: products.map(p => p._id) });

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
    console.log('Get product:', { id: req.params.id, found: !!product, product: product ? { _id: product._id, name: product.name } : null });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.status(200).json({
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        media: product.media,
        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        likes: product.wishlist || [],
        likeCount: product.wishlist?.length || 0,
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

  const { name, description, price, category } = req.body;
  const files = req.files;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (product.createdBy.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized to update this product' });
    }

    if (files && files.length > 0 && product.media.length > 0) {
      await Promise.all(
        product.media.map((media) =>
          cloudinary.uploader.destroy(media.publicId, {
            resource_type: media.mediaType,
          })
        )
      );
    }

    const newMedia = files && files.length > 0
      ? files.map((file) => ({
          url: file.path,
          mediaType: file.mimetype.startsWith('video') ? 'video' : 'image',
          publicId: file.filename,
        }))
      : product.media;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.media = newMedia;
    product.updatedAt = Date.now();

    await product.save();

    res.status(200).json({
      msg: 'Product updated successfully',
      product,
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

    if (product.media.length > 0) {
      await Promise.all(
        product.media.map((media) =>
          cloudinary.uploader.destroy(media.publicId, {
            resource_type: media.mediaType,
          })
        )
      );
    }

    await User.findByIdAndUpdate(product.createdBy, {
      $pull: { products: product._id, cart: product._id, wishlist: product._id },
    });

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
    console.log('Get related products for:', { id: req.params.id, found: !!product, product: product ? { _id: product._id, name: product.name } : null });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: req.params.id },
      $or: [
        { createdBy: product.createdBy },
        { category: product.category },
        { price: { $gte: product.price * 0.8, $lte: product.price * 1.2 } },
      ],
    })
      .limit(5)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    console.log('Related products:', { count: relatedProducts.length, products: relatedProducts.map(p => p._id) });

    res.status(200).json({
      count: relatedProducts.length,
      products: relatedProducts.map((p) => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        category: p.category,
        media: p.media,
        createdBy: p.createdBy,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
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

// =================== GET PRODUCTS BY CATEGORY (GET) ===================
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({ msg: 'Category is required' });
    }

    if (category === 'all') {
      const products = await Product.find().populate('createdBy', 'name email');
      console.log('Get products by category (all):', { count: products.length, products: products.map(p => p._id) });
      return res.json({ products });
    }

    const products = await Product.find({ category }).populate('createdBy', 'name email');
    console.log('Get products by category:', { category, count: products.length, products: products.map(p => p._id) });

    res.json({ products });
  } catch (err) {
    console.error('Get products by category error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== TOGGLE CART (POST) ===================
exports.toggleCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const isInCart = user.cart.includes(req.params.productId);
    if (isInCart) {
      user.cart = user.cart.filter((id) => id.toString() !== req.params.productId);
    } else {
      user.cart.push(req.params.productId);
    }

    await user.save();

    const populatedUser = await User.findById(req.user.userId).populate('cart');
    console.log('Toggle cart:', { userId: req.user.userId, productId: req.params.productId, isInCart: !isInCart });

    res.status(200).json({
      msg: isInCart ? 'Product removed from cart' : 'Product added to cart',
      cart: populatedUser.cart,
      isInCart: !isInCart,
    });
  } catch (err) {
    console.error('Toggle cart error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== TOGGLE WISHLIST (POST) ===================
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const isInWishlist = user.wishlist.includes(req.params.productId);
    if (isInWishlist) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    } else {
      user.wishlist.push(req.params.productId);
    }

    await user.save();

    const populatedUser = await User.findById(req.user.userId).populate('wishlist');
    console.log('Toggle wishlist:', { userId: req.user.userId, productId: req.params.productId, isWishlisted: !isInWishlist });

    res.status(200).json({
      msg: isInWishlist ? 'Product removed from wishlist' : 'Product added to wishlist',
      wishlist: populatedUser.wishlist,
      isWishlisted: !isInWishlist,
    });
  } catch (err) {
    console.error('Toggle wishlist error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = exports;