const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

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

module.exports = exports;