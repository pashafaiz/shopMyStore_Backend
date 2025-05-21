const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Notification = require('../../models/notification');
const { validationResult } = require('express-validator');

// =================== GET SELLER ORDERS ===================
exports.getSellerOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Get seller's product IDs
    const productIds = await Product.find({ 
      createdBy: req.user.userId 
    }).distinct('_id');

    let query = { product: { $in: productIds } };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'userName email phoneNumber')
      .populate('product', 'name price media')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== UPDATE ORDER STATUS ===================
exports.updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    // Check if order belongs to seller
    const product = await Product.findOne({ 
      _id: req.params.orderId, 
      createdBy: req.user.userId 
    });

    if (!product) {
      return res.status(404).json({ msg: 'Order not found or not authorized' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        msg: `Invalid status transition from ${order.status} to ${status}` 
      });
    }

    // Update order status
    order.status = status;
    await order.save();

    // Create notification for customer
    const notification = new Notification({
      user: order.user,
      title: 'Order Status Updated',
      body: `Your order #${order._id} status has been updated to ${status}`
    });
    await notification.save();

    res.status(200).json({
      msg: 'Order status updated successfully',
      order
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET ORDER DETAILS ===================
exports.getOrderDetails = async (req, res) => {
  try {
    // Check if order belongs to seller
    const product = await Product.findOne({ 
      _id: req.params.orderId, 
      createdBy: req.user.userId 
    });

    if (!product) {
      return res.status(404).json({ msg: 'Order not found or not authorized' });
    }

    const order = await Order.findById(req.params.orderId)
      .populate('user', 'userName email phoneNumber')
      .populate('product', 'name price media');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.status(200).json({
      order
    });
  } catch (err) {
    console.error('Get order details error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};