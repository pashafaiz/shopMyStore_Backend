const SellerAnalytics = require('../../models/SellerAnalytics');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const moment = require('moment');

// =================== GET SALES ANALYTICS ===================
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', limit = 12 } = req.query;

    // Calculate start date based on period
    let startDate;
    switch (period) {
      case 'daily':
        startDate = moment().subtract(limit, 'days').startOf('day');
        break;
      case 'weekly':
        startDate = moment().subtract(limit, 'weeks').startOf('week');
        break;
      case 'monthly':
        startDate = moment().subtract(limit, 'months').startOf('month');
        break;
      case 'yearly':
        startDate = moment().subtract(limit, 'years').startOf('year');
        break;
      default:
        startDate = moment().subtract(12, 'months').startOf('month');
    }

    // Get analytics data
    const analytics = await SellerAnalytics.find({
      seller: req.user.userId,
      period,
      date: { $gte: startDate.toDate() }
    }).sort({ date: 1 });

    // If no analytics data exists, generate it
    if (analytics.length === 0) {
      return res.status(200).json({
        msg: 'No analytics data found',
        analytics: []
      });
    }

    res.status(200).json({
      analytics
    });
  } catch (err) {
    console.error('Get sales analytics error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET DASHBOARD SUMMARY ===================
exports.getDashboardSummary = async (req, res) => {
  try {
    // Today's stats
    const todayStart = moment().startOf('day');
    const todayEnd = moment().endOf('day');

    const todayOrders = await Order.countDocuments({
      product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') },
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const todayRevenue = await Order.aggregate([
      { 
        $match: { 
          product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') },
          createdAt: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
          status: { $ne: 'cancelled' }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Weekly stats
    const weekStart = moment().startOf('week');
    const weekEnd = moment().endOf('week');

    const weekOrders = await Order.countDocuments({
      product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') },
      createdAt: { $gte: weekStart, $lte: weekEnd }
    });

    const weekRevenue = await Order.aggregate([
      { 
        $match: { 
          product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') },
          createdAt: { $gte: weekStart.toDate(), $lte: weekEnd.toDate() },
          status: { $ne: 'cancelled' }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Monthly stats
    const monthStart = moment().startOf('month');
    const monthEnd = moment().endOf('month');

    const monthOrders = await Order.countDocuments({
      product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') },
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });

    const monthRevenue = await Order.aggregate([
      { 
        $match: { 
          product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') },
          createdAt: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
          status: { $ne: 'cancelled' }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // Yearly stats
    const yearStart = moment().startOf('year');
    const yearEnd = moment().endOf('year');

    const yearOrders = await Order.countDocuments({
      product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') },
      createdAt: { $gte: yearStart, $lte: yearEnd }
    });

    const yearRevenue = await Order.aggregate([
      { 
        $match: { 
          product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') },
          createdAt: { $gte: yearStart.toDate(), $lte: yearEnd.toDate() },
          status: { $ne: 'cancelled' }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // All time stats
    const allTimeOrders = await Order.countDocuments({
      product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') }
    });

    const allTimeRevenue = await Order.aggregate([
      { 
        $match: { 
          product: { $in: await Product.find({ createdBy: req.user.userId }).distinct('_id') },
          status: { $ne: 'cancelled' }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    res.status(200).json({
      today: {
        orders: todayOrders,
        revenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0
      },
      week: {
        orders: weekOrders,
        revenue: weekRevenue.length > 0 ? weekRevenue[0].total : 0
      },
      month: {
        orders: monthOrders,
        revenue: monthRevenue.length > 0 ? monthRevenue[0].total : 0
      },
      year: {
        orders: yearOrders,
        revenue: yearRevenue.length > 0 ? yearRevenue[0].total : 0
      },
      allTime: {
        orders: allTimeOrders,
        revenue: allTimeRevenue.length > 0 ? allTimeRevenue[0].total : 0
      }
    });
  } catch (err) {
    console.error('Get dashboard summary error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};