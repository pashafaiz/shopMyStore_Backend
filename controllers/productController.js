// const Product = require('../models/Product');
// const User = require('../models/User');
// const Review = require('../models/Review');
// const { validationResult } = require('express-validator');
// const cloudinary = require('../config/cloudinary');
// const mongoose = require('mongoose');

// // =================== CREATE PRODUCT (POST) ===================
// exports.createProduct = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const {
//     name,
//     description,
//     price,
//     originalPrice,
//     discount,
//     category,
//     sizes,
//     colors,
//     highlights,
//     specifications,
//     tags,
//   } = req.body;
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
//       originalPrice: originalPrice || price,
//       discount: discount || 0,
//       category: category || 'Accessories',
//       media,
//       sizes: sizes ? JSON.parse(sizes) : [],
//       colors: colors ? JSON.parse(colors) : [],
//       highlights: highlights ? JSON.parse(highlights) : [],
//       specifications: specifications ? JSON.parse(specifications) : [],
//       tags: tags ? JSON.parse(tags) : [],
//       createdBy: req.user.userId,
//     });

//     user.products.push(product._id);
//     await user.save();
//     await product.save();

//     res.status(201).json({
//       msg: 'Product created successfully',
//       product,
//     });
//   } catch (err) {
//     console.error('Product creation error:', err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== GET ALL PRODUCTS (GET) ===================
// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find().sort({ createdAt: -1 }).populate('createdBy', 'userName email');
//     console.log('Get all products:', { count: products.length });

//     res.status(200).json({
//       count: products.length,
//       products: products.map((product) => ({
//         id: product._id,
//         name: product.name,
//         description: product.description,
//         price: product.price,
//         originalPrice: product.originalPrice,
//         discount: product.discount,
//         media: product.media,
//         category: product.category,
//         sizes: product.sizes,
//         colors: product.colors,
//         highlights: product.highlights,
//         specifications: product.specifications,
//         tags: product.tags,
//         rating: product.rating,
//         reviewCount: product.reviewCount,
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
//     const product = await Product.findById(req.params.id).populate('createdBy', 'userName email phoneNumber');
//     console.log('Get product:', { id: req.params.id, found: !!product });

//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     res.status(200).json({
//       product: {
//         id: product._id,
//         name: product.name,
//         description: product.description,
//         price: product.price,
//         originalPrice: product.originalPrice,
//         discount: product.discount,
//         category: product.category,
//         media: product.media,
//         sizes: product.sizes,
//         colors: product.colors,
//         highlights: product.highlights,
//         specifications: product.specifications,
//         tags: product.tags,
//         rating: product.rating,
//         reviewCount: product.reviewCount,
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

//   const {
//     name,
//     description,
//     price,
//     originalPrice,
//     discount,
//     category,
//     sizes,
//     colors,
//     highlights,
//     specifications,
//     tags,
//   } = req.body;
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
//     product.originalPrice = originalPrice || product.originalPrice;
//     product.discount = discount || product.discount;
//     product.category = category || product.category;
//     product.media = newMedia;
//     product.sizes = sizes ? JSON.parse(sizes) : product.sizes;
//     product.colors = colors ? JSON.parse(colors) : product.colors;
//     product.highlights = highlights ? JSON.parse(highlights) : product.highlights;
//     product.specifications = specifications ? JSON.parse(specifications) : product.specifications;
//     product.tags = tags ? JSON.parse(tags) : product.tags;
//     product.updatedAt = Date.now();

//     await product.save();

//     res.status(200).json({
//       msg: 'Product updated successfully',
//       product,
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

//     if (product.media.length > 0) {
//       await Promise.all(
//         product.media.map((media) =>
//           cloudinary.uploader.destroy(media.publicId, {
//             resource_type: media.mediaType,
//           })
//         )
//       );
//     }

//     await User.findByIdAndUpdate(product.createdBy, {
//       $pull: { products: product._id, cart: product._id, wishlist: product._id },
//     });

//     await Review.deleteMany({ product: product._id });
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
//     console.log('Get related products for:', { id: req.params.id, found: !!product });

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
//       .populate('createdBy', 'userName email');

//     res.status(200).json({
//       count: relatedProducts.length,
//       products: relatedProducts.map((p) => ({
//         _id: p._id,
//         name: p.name,
//         price: p.price,
//         originalPrice: p.originalPrice,
//         discount: p.discount,
//         category: p.category,
//         media: p.media,
//         sizes: p.sizes,
//         colors: p.colors,
//         highlights: p.highlights,
//         specifications: p.specifications,
//         tags: p.tags,
//         rating: p.rating,
//         reviewCount: p.reviewCount,
//         createdBy: p.createdBy,
//         createdAt: p.createdAt,
//         updatedAt: p.updatedAt,
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

// // =================== GET PRODUCTS BY CATEGORY (GET) ===================
// exports.getProductsByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;

//     if (!category) {
//       return res.status(400).json({ msg: 'Category is required' });
//     }

//     if (category === 'all') {
//       const products = await Product.find().populate('createdBy', 'userName email');
//       console.log('Get products by category (all):', { count: products.length });
//       return res.json({ products });
//     }

//     const products = await Product.find({ category }).populate('createdBy', 'userName email');
//     console.log('Get products by category:', { category, count: products.length });

//     res.json({ products });
//   } catch (err) {
//     console.error('Get products by category error:', err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== ADD TO CART (POST) ===================
// exports.addToCart = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.productId);
//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     if (user.cart.includes(req.params.productId)) {
//       return res.status(400).json({ msg: 'Product already in cart' });
//     }

//     user.cart.push(req.params.productId);
//     await user.save();

//     res.status(200).json({ msg: 'Product added to cart', cart: user.cart });
//   } catch (err) {
//     console.error('Add to cart error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== TOGGLE WISHLIST (POST) ===================
// exports.toggleWishlist = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.productId);
//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     const isInWishlist = user.wishlist.includes(req.params.productId);
//     if (isInWishlist) {
//       user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
//     } else {
//       user.wishlist.push(req.params.productId);
//     }
//     await user.save();

//     res.status(200).json({
//       msg: isInWishlist ? 'Product removed from wishlist' : 'Product added to wishlist',
//       wishlist: user.wishlist,
//     });
//   } catch (err) {
//     console.error('Toggle wishlist error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== GET CART (GET) ===================
// // =================== GET CART (GET) ===================
// exports.getCart = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).populate('cart');
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     res.status(200).json({ cart: user.cart });
//   } catch (err) {
//     console.error('Get cart error:', err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== REMOVE FROM CART (DELETE) ===================
// exports.removeFromCart = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     user.cart = user.cart.filter((id) => id.toString() !== req.params.productId);
//     await user.save();

//     res.status(200).json({ msg: 'Product removed from cart', cart: user.cart });
//   } catch (err) {
//     console.error('Remove from cart error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== GET WISHLIST (GET) ===================
// exports.getWishlist = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).populate('wishlist');
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     res.status(200).json({ wishlist: user.wishlist });
//   } catch (err) {
//     console.error('Get wishlist error:', err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== REMOVE FROM WISHLIST (DELETE) ===================
// exports.removeFromWishlist = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
//     await user.save();

//     res.status(200).json({ msg: 'Product removed from wishlist', wishlist: user.wishlist });
//   } catch (err) {
//     console.error('Remove from wishlist error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== CREATE REVIEW (POST) ===================
// exports.createReview = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { productId, rating, comment } = req.body;
//   const userId = req.user.userId;

//   try {
//     const [product, user, existingReview] = await Promise.all([
//       Product.findById(productId),
//       User.findById(userId),
//       Review.findOne({ product: productId, user: userId }),
//     ]);

//     if (!product) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     if (existingReview) {
//       return res.status(400).json({ msg: 'You have already reviewed this product' });
//     }

//     const review = new Review({
//       product: productId,
//       user: userId,
//       rating,
//       comment,
//     });

//     await review.save();

//     // Update product's rating and review count
//     const reviews = await Review.find({ product: productId });
//     const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
//     product.rating = Math.round(avgRating * 10) / 10;
//     product.reviewCount = reviews.length;
//     await product.save();

//     res.status(201).json({
//       msg: 'Review created successfully',
//       review: {
//         id: review._id,
//         product: review.product,
//         user: user.userName,
//         rating: review.rating,
//         comment: review.comment,
//         date: review.createdAt,
//       },
//     });
//   } catch (err) {
//     console.error('Create review error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product or user not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== GET PRODUCT REVIEWS (GET) ===================
// exports.getProductReviews = async (req, res) => {
//   try {
//     const reviews = await Review.find({ product: req.params.productId })
//       .populate('user', 'userName')
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       count: reviews.length,
//       reviews: reviews.map((review) => ({
//         id: review._id,
//         product: review.product,
//         user: review.user.userName,
//         rating: review.rating,
//         comment: review.comment,
//         date: review.createdAt,
//       })),
//     });
//   } catch (err) {
//     console.error('Get reviews error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Product not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// // =================== DELETE REVIEW (DELETE) ===================
// exports.deleteReview = async (req, res) => {
//   try {
//     const review = await Review.findById(req.params.reviewId);

//     if (!review) {
//       return res.status(404).json({ msg: 'Review not found' });
//     }

//     if (review.user.toString() !== req.user.userId) {
//       return res.status(401).json({ msg: 'Not authorized to delete this review' });
//     }

//     await review.deleteOne();

//     // Update product's rating and review count
//     const reviews = await Review.find({ product: review.product });
//     const product = await Product.findById(review.product);
//     if (product) {
//       const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
//       product.rating = Math.round(avgRating * 10) / 10;
//       product.reviewCount = reviews.length;
//       await product.save();
//     }

//     res.status(200).json({ msg: 'Review deleted successfully' });
//   } catch (err) {
//     console.error('Delete review error:', err);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Review not found' });
//     }
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// };

// module.exports = exports;







const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Order = require('../models/Order');
const PromoCode = require('../models/PromoCode');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// =================== CREATE PRODUCT (POST) ===================
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    description,
    price,
    originalPrice,
    discount,
    category,
    sizes,
    colors,
    highlights,
    specifications,
    tags,
    stock,
    brand,
    offer,
  } = req.body;
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
      originalPrice: originalPrice || price,
      discount: discount || 0,
      category: category || 'Accessories',
      media,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      highlights: highlights ? JSON.parse(highlights) : [],
      specifications: specifications ? JSON.parse(specifications) : [],
      tags: tags ? JSON.parse(tags) : [],
      stock: stock || 0,
      brand,
      offer: offer || '',
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
    const products = await Product.find().sort({ createdAt: -1 }).populate('createdBy', 'userName email');
    console.log('Get all products:', { count: products.length });

    res.status(200).json({
      count: products.length,
      products: products.map((product) => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        media: product.media,
        category: product.category,
        sizes: product.sizes,
        colors: product.colors,
        highlights: product.highlights,
        specifications: product.specifications,
        tags: product.tags,
        stock: product.stock,
        brand: product.brand,
        offer: product.offer,
        rating: product.rating,
        reviewCount: product.reviewCount,
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
    const product = await Product.findById(req.params.id).populate('createdBy', 'userName email phoneNumber');
    console.log('Get product:', { id: req.params.id, found: !!product });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.status(200).json({
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        category: product.category,
        media_streams: product.media,
        sizes: product.sizes,
        colors: product.colors,
        highlights: product.highlights,
        specifications: product.specifications,
        tags: product.tags,
        stock: product.stock,
        brand: product.brand,
        offer: product.offer,
        rating: product.rating,
        reviewCount: product.reviewCount,
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

  const {
    name,
    description,
    price,
    originalPrice,
    discount,
    category,
    sizes,
    colors,
    highlights,
    specifications,
    tags,
    stock,
    brand,
    offer,
  } = req.body;
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
    product.originalPrice = originalPrice || product.originalPrice;
    product.discount = discount || product.discount;
    product.category = category || product.category;
    product.media = newMedia;
    product.sizes = sizes ? JSON.parse(sizes) : product.sizes;
    product.colors = colors ? JSON.parse(colors) : product.colors;
    product.highlights = highlights ? JSON.parse(highlights) : product.highlights;
    product.specifications = specifications ? JSON.parse(specifications) : product.specifications;
    product.tags = tags ? JSON.parse(tags) : product.tags;
    product.stock = stock !== undefined ? stock : product.stock;
    product.brand = brand || product.brand;
    product.offer = offer !== undefined ? offer : product.offer;
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

    await Review.deleteMany({ product: product._id });
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
    console.log('Get related products for:', { id: req.params.id, found: !!product });

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: req.params.id },
      $or: [
        { createdBy: product.createdBy },
        { category: product.category },
        { brand: product.brand },
        { price: { $gte: product.price * 0.8, $lte: product.price * 1.2 } },
      ],
    })
      .limit(5)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'userName email');

    res.status(200).json({
      count: relatedProducts.length,
      products: relatedProducts.map((p) => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        category: p.category,
        media: p.media,
        sizes: p.sizes,
        colors: p.colors,
        highlights: p.highlights,
        specifications: p.specifications,
        tags: p.tags,
        stock: p.stock,
        brand: p.brand,
        offer: p.offer,
        rating: p.rating,
        reviewCount: p.reviewCount,
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
      const products = await Product.find().populate('createdBy', 'userName email');
      console.log('Get products by category (all):', { count: products.length });
      return res.json({ products });
    }

    const products = await Product.find({ category }).populate('createdBy', 'userName email');
    console.log('Get products by category:', { category, count: products.length });

    res.json({ products });
  } catch (err) {
    console.error('Get products by category error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== ADD TO CART (POST) ===================
exports.addToCart = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ msg: 'Product is out of stock' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.cart.includes(req.params.productId)) {
      return res.status(400).json({ msg: 'Product already in cart' });
    }

    user.cart.push(req.params.productId);
    await user.save();

    res.status(200).json({ msg: 'Product added to cart', cart: user.cart });
  } catch (err) {
    console.error('Add to cart error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== TOGGLE WISHLIST (POST) ===================
exports.toggleWishlist = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isInWishlist = user.wishlist.includes(req.params.productId);
    if (isInWishlist) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    } else {
      user.wishlist.push(req.params.productId);
    }
    await user.save();

    res.status(200).json({
      msg: isInWishlist ? 'Product removed from wishlist' : 'Product added to wishlist',
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error('Toggle wishlist error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET CART (GET) ===================
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('cart');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ cart: user.cart });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== REMOVE FROM CART (DELETE) ===================
exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.cart = user.cart.filter((id) => id.toString() !== req.params.productId);
    await user.save();

    res.status(200).json({ msg: 'Product removed from cart', cart: user.cart });
  } catch (err) {
    console.error('Remove from cart error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET WISHLIST (GET) ===================
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('wishlist');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ wishlist: user.wishlist });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== REMOVE FROM WISHLIST (DELETE) ===================
exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    await user.save();

    res.status(200).json({ msg: 'Product removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== CREATE REVIEW (POST) ===================
exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { productId, rating, comment } = req.body;
  const userId = req.user.userId;

  try {
    const [product, user, existingReview] = await Promise.all([
      Product.findById(productId),
      User.findById(userId),
      Review.findOne({ product: productId, user: userId }),
    ]);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (existingReview) {
      return res.status(400).json({ msg: 'You have already reviewed this product' });
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
    });

    await review.save();

    // Update product's rating and review count
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.reviewCount = reviews.length;
    await product.save();

    res.status(201).json({
      msg: 'Review created successfully',
      review: {
        id: review._id,
        product: review.product,
        user: user.userName,
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
      },
    });
  } catch (err) {
    console.error('Create review error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product or user not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET PRODUCT REVIEWS (GET) ===================
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'userName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews: reviews.map((review) => ({
        id: review._id,
        product: review.product,
        user: review.user.userName,
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
      })),
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== DELETE REVIEW (DELETE) ===================
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    if (review.user.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    // Update product's rating and review count
    const reviews = await Review.find({ product: review.product });
    const product = await Product.findById(review.product);
    if (product) {
      const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
      product.rating = Math.round(avgRating * 10) / 10;
      product.reviewCount = reviews.length;
      await product.save();
    }

    res.status(200).json({ msg: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Review not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};





// =================== GET SELLER DASHBOARD (GET) ===================
exports.getSellerDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can access dashboard' });
    }

    const [totalProducts, totalOrders, recentOrders, topProducts, lowStock] = await Promise.all([
      Product.countDocuments({ createdBy: req.user.userId }),
      Order.countDocuments({ product: { $in: user.products } }),
      Order.find({ product: { $in: user.products } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('product', 'name price media')
        .populate('user', 'userName email phoneNumber'),
      Product.find({ createdBy: req.user.userId })
        .sort({ reviewCount: -1 })
        .limit(5)
        .select('name price rating reviewCount stock'),
      Product.find({ createdBy: req.user.userId, stock: { $lte: 10 } })
        .select('name stock'),
    ]);

    const totalRevenue = await Order.aggregate([
      { $match: { product: { $in: user.products }, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    res.status(200).json({
      dashboard: {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          product: order.product,
          user: {
            userName: order.user.userName,
            email: order.user.email,
            phoneNumber: order.user.phoneNumber,
          },
          quantity: order.quantity,
          size: order.size,
          color: order.color,
          address: order.address,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        })),
        topProducts,
        lowStock,
      },
    });
  } catch (err) {
    console.error('Get seller dashboard error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET SELLER ORDERS (GET) ===================
exports.getSellerOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can access orders' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ product: { $in: user.products } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('product', 'name price media')
      .populate('user', 'userName email phoneNumber');

    const total = await Order.countDocuments({ product: { $in: user.products } });

    res.status(200).json({
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders: orders.map(order => ({
        id: order._id,
        product: {
          id: order.product._id,
          name: order.product.name,
          price: order.product.price,
          media: order.product.media,
        },
        user: {
          userName: order.user.userName,
          email: order.user.email,
          phoneNumber: order.user.phoneNumber,
        },
        quantity: order.quantity,
        size: order.size,
        color : order.color,
        address: order.address,
        paymentMethod: order.paymentMethod,
        promoCode: order.promoCode,
        discount: order.discount,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        status: order.status,
        tracking: order.tracking,
        returnRequest: order.returnRequest,
        refundStatus: order.refundStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== UPDATE ORDER STATUS (PUT) ===================
exports.updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller' || !user.products.includes(order.product)) {
      return res.status(403).json({ msg: 'Not authorized to update this order' });
    }

    order.status = status;
    if (status === 'delivered') {
      user.sellerStats.totalSales += order.quantity;
      user.sellerStats.totalRevenue += order.total;
      user.sellerStats.totalOrders += 1;
      await user.save();
    }

    await order.save();

    // Add notification
    user.notifications.push({
      type: 'order',
      message: `Order ${order._id} status updated to ${status}`,
    });
    await user.save();

    res.status(200).json({ msg: 'Order status updated', order });
  } catch (err) {
    console.error('Update order status error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== UPDATE ORDER TRACKING (PUT) ===================
exports.updateOrderTracking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { trackingId, carrier, status, location } = req.body;

  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller' || !user.products.includes(order.product)) {
      return res.status(403).json({ msg: 'Not authorized to update tracking' });
    }

    order.tracking.trackingId = trackingId || order.tracking.trackingId;
    order.tracking.carrier = carrier || order.tracking.carrier;
    order.tracking.status = status || order.tracking.status;
    if (location && status) {
      order.tracking.updates.push({ status, location });
    }

    await order.save();

    // Add notification
    user.notifications.push({
      type: 'order',
      message: `Tracking updated for order ${order._id}: ${status}`,
    });
    await user.save();

    res.status(200).json({ msg: 'Tracking updated', tracking: order.tracking });
  } catch (err) {
    console.error('Update tracking error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== CANCEL ORDER (PUT) ===================
exports.cancelOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { reason } = req.body;

  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller' || !user.products.includes(order.product)) {
      return res.status(403).json({ msg: 'Not authorized to cancel this order' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ msg: 'Cannot cancel delivered or already cancelled order' });
    }

    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();

    // Update product stock
    const product = await Product.findById(order.product);
    if (product) {
      product.stock += order.quantity;
      await product.save();
    }

    // Add notification
    user.notifications.push({
      type: 'order',
      message: `Order ${order._id} cancelled: ${reason}`,
    });
    await user.save();

    res.status(200).json({ msg: 'Order cancelled successfully', order });
  } catch (err) {
    console.error('Cancel order error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET LOW STOCK ALERTS (GET) ===================
exports.getLowStockAlerts = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can access low stock alerts' });
    }

    const lowStock = await Product.find({
      createdBy: req.user.userId,
      stock: { $lte: 10 },
    }).select('name stock price media');

    if (lowStock.length > 0) {
      user.notifications.push({
        type: 'low_stock',
        message: `${lowStock.length} products are low in stock`,
      });
      await user.save();
    }

    res.status(200).json({
      count: lowStock.length,
      lowStock,
    });
  } catch (err) {
    console.error('Get low stock alerts error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== CREATE PROMO CODE (POST) ===================
exports.createPromoCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { code, discount, validFrom, validUntil, maxUses, applicableProducts } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can create promo codes' });
    }

    const existingPromo = await PromoCode.findOne({ code });
    if (existingPromo) {
      return res.status(400).json({ msg: 'Promo code already exists' });
    }

    const promoCode = new PromoCode({
      code,
      discount,
      validFrom,
      validUntil,
      maxUses,
      createdBy: req.user.userId,
      applicableProducts: applicableProducts || user.products,
    });

    await promoCode.save();

    user.notifications.push({
      type: 'promo',
      message: `Promo code ${code} created successfully`,
    });
    await user.save();

    res.status(201).json({
      msg: 'Promo code created',
      promoCode: {
        id: promoCode._id,
        code: promoCode.code,
        discount: promoCode.discount,
        validFrom: promoCode.validFrom,
        validUntil: promoCode.validUntil,
        maxUses: promoCode.maxUses,
        currentUses: promoCode.currentUses,
        applicableProducts: promoCode.applicableProducts,
        isActive: promoCode.isActive,
        createdAt: promoCode.createdAt,
      },
    });
  } catch (err) {
    console.error('Create promo code error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};


// =================== DELETE PROMO CODE (DELETE) ===================
exports.deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.promoId);
    if (!promoCode) {
      return res.status(404).json({ msg: 'Promo code not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller' || promoCode.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Not authorized to delete this promo code' });
    }

    await promoCode.deleteOne();

    user.notifications.push({
      type: 'promo',
      message: `Promo code ${promoCode.code} deleted`,
    });
    await user.save();

    res.status(200).json({ msg: 'Promo code deleted successfully' });
  } catch (err) {
    console.error('Delete promo code error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Promo code not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET SELLER NOTIFICATIONS (GET) ===================
exports.getSellerNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can access notifications' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = user.notifications
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    res.status(200).json({
      count: notifications.length,
      total: user.notifications.length,
      page,
      pages: Math.ceil(user.notifications.length / limit),
      notifications,
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== MARK NOTIFICATION AS READ (PUT) ===================
exports.markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can update notifications' });
    }

    const notification = user.notifications.id(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    notification.isRead = true;
    await user.save();

    res.status(200).json({ msg: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Mark notification read error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== HANDLE SUPPORT TICKET (POST) ===================
exports.handleSupportTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { customerId, subject, message } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can handle support tickets' });
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    const ticketId = `TICKET-${uuidv4()}`;
    user.supportTickets.push({
      ticketId,
      customer: customerId,
      subject,
      message,
    });

    await user.save();

    user.notifications.push({
      type: 'support',
      message: `New support ticket ${ticketId} created`,
    });
    await user.save();

    res.status(201).json({ msg: 'Support ticket created', ticketId });
  } catch (err) {
    console.error('Handle support ticket error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== UPDATE SUPPORT TICKET STATUS (PUT) ===================
exports.updateSupportTicketStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can update support tickets' });
    }

    const ticket = user.supportTickets.find(t => t.ticketId === req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ msg: 'Support ticket not found' });
    }

    ticket.status = status;
    await user.save();

    user.notifications.push({
      type: 'support',
      message: `Support ticket ${req.params.ticketId} updated to ${status}`,
    });
    await user.save();

    res.status(200).json({ msg: 'Support ticket status updated', ticket });
  } catch (err) {
    console.error('Update support ticket error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== HANDLE RETURN REQUEST (PUT) ===================
exports.handleReturnRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status, reason } = req.body;

  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller' || !user.products.includes(order.product)) {
      return res.status(403).json({ msg: 'Not authorized to handle this return' });
    }

    // Allow seller to initiate return request if none exists
    if (order.returnRequest.status === 'none') {
      order.returnRequest.status = status;
      order.returnRequest.reason = reason || 'Initiated by seller';
      order.returnRequest.requestedAt = Date.now();
    } else {
      order.returnRequest.status = status;
      if (reason) order.returnRequest.reason = reason;
    }

    if (status === 'approved' && order.refundStatus.status === 'none') {
      order.refundStatus.status = 'initiated';
      order.refundStatus.amount = order.total;
    }

    await order.save();

    user.notifications.push({
      type: 'order',
      message: `Return request for order ${order._id} ${status}`,
    });
    await user.save();

    res.status(200).json({ msg: 'Return request handled', returnRequest: order.returnRequest });
  } catch (err) {
    console.error('Handle return request error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== PROCESS REFUND (PUT) ===================
exports.processRefund = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const user = await User.findById(req.user.userId);
       if (!user || user.userType !== 'seller' || !user.products.includes(order.product)) {
      return res.status(403).json({ msg: 'Not authorized to process refund' });
    }

    // Allow initiating refund if none exists and return is approved
    if (order.refundStatus.status === 'none' && order.returnRequest.status === 'approved') {
      order.refundStatus.status = 'initiated';
      order.refundStatus.amount = order.total;
    }

    if (order.refundStatus.status === 'none') {
      return res.status(400).json({ msg: 'No refund can be initiated without an approved return' });
    }

    order.refundStatus.status = status;
    if (status === 'completed') {
      order.refundStatus.refundedAt = Date.now();
      user.sellerStats.totalRevenue -= order.refundStatus.amount;
      await user.save();
    }

    await order.save();

    user.notifications.push({
      type: 'order',
      message: `Refund ${status} for order ${order._id}`,
    });
    await user.save();

    res.status(200).json({ msg: 'Refund processed', refundStatus: order.refundStatus });
  } catch (err) {
    console.error('Process refund error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET SELLER PROFILE (GET) ===================
exports.getSellerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      'fullName userName email phoneNumber profilePicture bio socialLinks sellerStats userType'
    );
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can access profile' });
    }

    res.status(200).json({
      profile: {
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        bio: user.bio,
        socialLinks: user.socialLinks,
        sellerStats: user.sellerStats,
      },
    });
  } catch (err) {
    console.error('Get seller profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== UPDATE SELLER PROFILE (PUT) ===================
exports.updateSellerProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, userName, email, phoneNumber, bio, socialLinks } = req.body;
  const file = req.file;

  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can update profile' });
    }

    if (file) {
      if (user.profilePicture && !user.profilePicture.includes('default-profile')) {
        await cloudinary.uploader.destroy(user.profilePicture.split('/').pop().split('.')[0]);
      }
      user.profilePicture = file.path;
    }

    user.fullName = fullName || user.fullName;
    user.userName = userName || user.userName;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.bio = bio || user.bio;
    user.socialLinks = socialLinks || user.socialLinks;

    await user.save();

    res.status(200).json({ msg: 'Profile updated', profile: user });
  } catch (err) {
    console.error('Update seller profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET SELLER ANALYTICS (GET) ===================
exports.getSellerAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can access analytics' });
    }

    const [salesData, topProducts, orderStats, returnStats] = await Promise.all([
      Order.aggregate([
        { $match: { product: { $in: user.products }, status: 'delivered' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalSales: { $sum: '$quantity' },
            totalRevenue: { $sum: '$total' },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      Product.find({ createdBy: req.user.userId })
        .sort({ reviewCount: -1 })
        .limit(5)
        .select('name price rating reviewCount stock'),
      Order.aggregate([
        { $match: { product: { $in: user.products } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: { product: { $in: user.products }, 'returnRequest.status': { $ne: 'none' } } },
        {
          $group: {
            _id: '$returnRequest.status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.status(200).json({
      analytics: {
        salesData,
        topProducts,
        orderStats,
        returnStats,
      },
    });
  } catch (err) {
    console.error('Get seller analytics error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== BULK UPDATE STOCK (PUT) ===================
exports.bulkUpdateStock = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { products } = req.body; // Array of { productId, stock }

  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller') {
      return res.status(403).json({ msg: 'Only sellers can update stock' });
    }

    const updatedProducts = [];
    for (const { productId, stock } of products) {
      const product = await Product.findById(productId);
      if (!product || product.createdBy.toString() !== req.user.userId) {
        continue;
      }
      product.stock = stock;
      await product.save();
      updatedProducts.push(product);
    }

    if (updatedProducts.length === 0) {
      return res.status(400).json({ msg: 'No valid products updated' });
    }

    user.notifications.push({
      type: 'low_stock',
      message: `Stock updated for ${updatedProducts.length} products`,
    });
    await user.save();

    res.status(200).json({ msg: 'Stock updated', updatedProducts });
  } catch (err) {
    console.error('Bulk update stock error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};



// =================== APPLY PROMO CODE (POST) ===================
exports.applyPromoCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { code, productId } = req.body;

  try {
    const promoCode = await PromoCode.findOne({ code, isActive: true });
    if (!promoCode) {
      return res.status(404).json({ msg: 'Promo code not found or inactive' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'seller' || promoCode.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Not authorized to apply this promo code' });
    }

    if (promoCode.validFrom > new Date() || promoCode.validUntil < new Date()) {
      return res.status(400).json({ msg: 'Promo code is not valid at this time' });
    }

    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return res.status(400).json({ msg: 'Promo code has reached maximum usage' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (!promoCode.applicableProducts.includes(productId)) {
      return res.status(400).json({ msg: 'Promo code not applicable to this product' });
    }

    promoCode.currentUses += 1;
    await promoCode.save();

    const discountAmount = (product.price * promoCode.discount) / 100;
    const discountedPrice = product.price - discountAmount;

    user.notifications.push({
      type: 'promo',
      message: `Promo code ${code} applied to product ${product.name}`,
    });
    await user.save();

    res.status(200).json({
      msg: `Promo code ${code} applied successfully`,
      discount: promoCode.discount,
      discountAmount,
      discountedPrice,
      promoCodeId: promoCode._id,
    });
  } catch (err) {
    console.error('Apply promo code error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Invalid product ID' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};



module.exports = exports;