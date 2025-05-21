const mongoose = require('mongoose');

const sellerAnalyticsSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  activeProducts: {
    type: Number,
    default: 0
  },
  outOfStockProducts: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  pendingOrders: {
    type: Number,
    default: 0
  },
  completedOrders: {
    type: Number,
    default: 0
  },
  cancelledOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalProfit: {
    type: Number,
    default: 0
  },
  newCustomers: {
    type: Number,
    default: 0
  },
  returningCustomers: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

sellerAnalyticsSchema.index({ seller: 1, date: -1 });
sellerAnalyticsSchema.index({ seller: 1, period: 1, date: -1 });

module.exports = mongoose.model('SellerAnalytics', sellerAnalyticsSchema);