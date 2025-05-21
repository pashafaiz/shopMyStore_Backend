const Product = require('../../models/Product');
const User = require('../../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../../config/cloudinary');
const { default: mongoose } = require('mongoose');

// =================== GET SELLER PRODUCTS ===================
exports.getSellerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { createdBy: req.user.userId };

    if (status === 'active') {
      query.stock = { $gt: 0 };
    } else if (status === 'out_of_stock') {
      query.stock = 0;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      products
    });
  } catch (err) {
    console.error('Get seller products error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET SELLER PRODUCT ANALYTICS ===================
exports.getProductAnalytics = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ createdBy: req.user.userId });
    const activeProducts = await Product.countDocuments({ 
      createdBy: req.user.userId, 
      stock: { $gt: 0 } 
    });
    const outOfStockProducts = await Product.countDocuments({ 
      createdBy: req.user.userId, 
      stock: 0 
    });

    const topSellingProducts = await Product.aggregate([
      { 
        $match: { 
          createdBy:new mongoose.Types.ObjectId(req.user.userId) 
        } 
      },
      {
        $project: {
          name: 1,
          price: 1,
          stock: 1,
          media: 1,
          sold: {
            $cond: {
              if: { $isArray: "$orders" },
              then: { $size: "$orders" },
              else: 0
            }
          }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      totalProducts,
      activeProducts,
      outOfStockProducts,
      topSellingProducts
    });
  } catch (err) {
    console.error('Get product analytics error:', err);
    res.status(500).json({ 
      msg: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};