const Product = require('../models/Product');
const Address = require('../models/Address');
const PromoCode = require('../models/PromoCode');
const Order = require('../models/Order');
const Notification = require('../models/notification');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getOrders = async (req, res) => {
  const userId = req.user.userId;
  const { page = 1, limit = 10, status } = req.query;

  try {
    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('product', 'name price media')
      .populate('seller', 'userName profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({ 
      msg: 'Orders retrieved successfully', 
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ 
      msg: 'Failed to fetch orders', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Fetch single order details with verification
exports.getOrderDetails = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const order = await Order.findOne({ _id: id, user: userId })
      .populate('product', 'name price media')
      .populate('seller', 'userName profilePicture');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found or not authorized' });
    }

    res.status(200).json({ 
      msg: 'Order details retrieved successfully', 
      order 
    });
  } catch (err) {
    console.error('Get order details error:', err);
    res.status(500).json({ 
      msg: 'Failed to fetch order details', 
      error: err.message 
    });
  }
};

// Fetch product details with seller information
exports.getProductDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)
      .select('name price media description stock')
      .populate('createdBy', 'userName profilePicture');

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.status(200).json({ 
      msg: 'Product retrieved successfully', 
      product 
    });
  } catch (err) {
    console.error('Get product details error:', err);
    res.status(500).json({ 
      msg: 'Failed to fetch product', 
      error: err.message 
    });
  }
};

// Enhanced address management
exports.getAddresses = async (req, res) => {
  const userId = req.user.userId;

  try {
    const addresses = await Address.find({ user: userId })
      .sort({ isDefault: -1, createdAt: -1 });
      
    res.status(200).json({ 
      msg: 'Addresses retrieved successfully', 
      addresses 
    });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ 
      msg: 'Failed to fetch addresses', 
      error: err.message 
    });
  }
};

// Add new address with validation
exports.addAddress = async (req, res) => {
  const userId = req.user.userId;
  const { address, city, state, zipCode, alternatePhone, isDefault } = req.body;
  const errors = {};

  // Validation
  if (!address || address.trim().length < 5) errors.address = 'Valid street address is required (min 5 chars)';
  if (!city || city.trim().length < 3) errors.city = 'Valid city is required (min 3 chars)';
  if (!state || state.trim().length < 3) errors.state = 'Valid state is required (min 3 chars)';
  if (!zipCode || !/^\d{6}$/.test(zipCode)) errors.zipCode = 'Valid 6-digit zip code is required';
  if (alternatePhone && !/^[6-9]\d{9}$/.test(alternatePhone)) {
    errors.alternatePhone = 'Invalid alternate phone number';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Reset existing default if new one is being set
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: userId,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      alternatePhone: alternatePhone ? alternatePhone.trim() : null,
      isDefault: isDefault || false,
    });

    res.status(201).json({ 
      msg: 'Address added successfully', 
      address: newAddress 
    });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ 
      msg: 'Failed to add address', 
      error: err.message 
    });
  }
};

// Delete address with default address handling
exports.deleteAddress = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    await Address.deleteOne({ _id: id });

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const remainingAddress = await Address.findOne({ user: userId });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    res.status(200).json({ 
      msg: 'Address deleted successfully' 
    });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ 
      msg: 'Failed to delete address', 
      error: err.message 
    });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    // Reset all addresses to non-default
    await Address.updateMany({ user: userId }, { isDefault: false });

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.status(200).json({ 
      msg: 'Default address updated successfully',
      address 
    });
  } catch (err) {
    console.error('Set default address error:', err);
    res.status(500).json({ 
      msg: 'Failed to set default address', 
      error: err.message 
    });
  }
};

// Validate promo code with enhanced checks
exports.validatePromoCode = async (req, res) => {
  const { code, productId } = req.body;

  if (!code) {
    return res.status(400).json({ errors: { code: 'Promo code is required' } });
  }

  try {
    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!promoCode) {
      return res.status(400).json({ errors: { code: 'Invalid promo code' } });
    }

    // Check expiration
    if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
      return res.status(400).json({ errors: { code: 'Promo code has expired' } });
    }

    // Check start date
    if (promoCode.startsAt && promoCode.startsAt > new Date()) {
      return res.status(400).json({ errors: { code: 'Promo code not yet valid' } });
    }

    // Check if product is eligible
    if (productId && promoCode.applicableProducts && promoCode.applicableProducts.length > 0) {
      if (!promoCode.applicableProducts.includes(productId)) {
        return res.status(400).json({ 
          errors: { code: 'Promo code not valid for this product' } 
        });
      }
    }

    res.status(200).json({
      msg: 'Promo code validated successfully',
      discount: promoCode.discount,
      discountType: promoCode.discountType || 'percentage',
      maxDiscount: promoCode.maxDiscount || null,
      minOrderValue: promoCode.minOrderValue || 0,
    });
  } catch (err) {
    console.error('Validate promo code error:', err);
    res.status(500).json({ 
      msg: 'Failed to validate promo code', 
      error: err.message 
    });
  }
};

// Create Razorpay order with enhanced options
exports.createRazorpayOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt, notes } = req.body;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
      payment_capture: 1 // Auto-capture payment
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    res.status(200).json({
      msg: 'Razorpay order created successfully',
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        createdAt: razorpayOrder.created_at
      },
    });
  } catch (err) {
    console.error('Create Razorpay order error:', err);
    res.status(500).json({ 
      msg: 'Failed to create Razorpay order', 
      error: err.message,
      razorpayError: err.error ? err.error.description : null
    });
  }
};

// Verify Razorpay payment signature
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ msg: 'Missing payment verification details' });
    }

    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Payment verification failed:', {
        generatedSignature,
        providedSignature: razorpay_signature
      });
      return res.status(400).json({ msg: 'Invalid payment signature' });
    }

    res.status(200).json({ 
      msg: 'Payment verified successfully',
      verified: true
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ 
      msg: 'Failed to verify payment', 
      error: err.message 
    });
  }
};

// Enhanced place order with all validations
exports.placeOrder = async (req, res) => {
  const userId = req.user.userId;
  const {
    productId,
    quantity,
    size,
    color,
    address,
    paymentMethod,
    promoCode,
    total,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;
  const errors = {};

  // Validation
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    errors.productId = 'Valid product ID is required';
  }
  if (!quantity || quantity < 1 || quantity > 10) {
    errors.quantity = 'Quantity must be between 1 and 10';
  }
  if (!address || !address.address || !address.city || !address.state || !address.zipCode) {
    errors.address = 'Complete address is required';
  }
  if (!paymentMethod || !['credit_card', 'upi', 'net_banking', 'wallet', 'cod'].includes(paymentMethod)) {
    errors.paymentMethod = 'Invalid payment method';
  }
  if (!total || total < 0) {
    errors.total = 'Total must be a positive number';
  }
  if (paymentMethod !== 'cod' && (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)) {
    errors.payment = 'Payment verification details are required for online payments';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ msg: 'Insufficient stock available' });
    }

    // Verify address belongs to user
    if (address._id) {
      const userAddress = await Address.findOne({ _id: address._id, user: userId });
      if (!userAddress) {
        return res.status(400).json({ msg: 'Invalid address selected' });
      }
    }

    let discount = 0;
    let discountAmount = 0;
    let promoCodeDetails = null;

    // Validate promo code if provided
    if (promoCode) {
      promoCodeDetails = await PromoCode.findOne({ 
        code: promoCode.toUpperCase(), 
        isActive: true 
      });

      if (!promoCodeDetails) {
        return res.status(400).json({ msg: 'Invalid promo code' });
      }
      if (promoCodeDetails.expiresAt && promoCodeDetails.expiresAt < new Date()) {
        return res.status(400).json({ msg: 'Promo code has expired' });
      }
      if (promoCodeDetails.startsAt && promoCodeDetails.startsAt > new Date()) {
        return res.status(400).json({ msg: 'Promo code not yet valid' });
      }

      // Calculate discount based on type
      if (promoCodeDetails.discountType === 'percentage') {
        discount = promoCodeDetails.discount;
        discountAmount = (product.price * quantity) * (discount / 100);
        
        // Apply max discount if specified
        if (promoCodeDetails.maxDiscount && discountAmount > promoCodeDetails.maxDiscount) {
          discountAmount = promoCodeDetails.maxDiscount;
        }
      } else {
        // Fixed amount discount
        discountAmount = promoCodeDetails.discount;
      }
    }

    // Calculate order totals
    const subtotal = product.price * quantity;
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping for orders over 500
    const tax = subtotal * 0.05; // 5% tax
    const calculatedTotal = (subtotal + shipping + tax - discountAmount).toFixed(2);

    // Verify calculated total matches provided total
    if (Math.abs(parseFloat(total) - parseFloat(calculatedTotal)) > 0.01) {
      console.error('Total mismatch:', {
        provided: total,
        calculated: calculatedTotal,
        subtotal,
        shipping,
        tax,
        discountAmount
      });
      return res.status(400).json({ msg: 'Order total mismatch' });
    }

    // For online payments, verify Razorpay payment
    if (paymentMethod !== 'cod') {
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        console.error('Payment verification failed:', {
          generatedSignature,
          providedSignature: razorpaySignature
        });
        return res.status(400).json({ msg: 'Invalid payment signature' });
      }
    }

    // Create the order
    const order = new Order({
      seller: product.createdBy,
      user: userId,
      product: productId,
      quantity,
      size,
      color,
      address,
      paymentMethod,
      promoCode: promoCodeDetails ? promoCodeDetails.code : null,
      discount: discountAmount,
      subtotal,
      shipping,
      tax,
      total: calculatedTotal,
      razorpayOrderId: paymentMethod !== 'cod' ? razorpayOrderId : null,
      razorpayPaymentId: paymentMethod !== 'cod' ? razorpayPaymentId : null,
      razorpaySignature: paymentMethod !== 'cod' ? razorpaySignature : null,
    });

    await order.save();

    // Update product stock
    product.stock -= quantity;
    product.orders.push(order._id);
    await product.save();

    // Create notifications
    const sellerNotification = new Notification({
      user: product.createdBy,
      title: 'New Order Received',
      body: `You have a new order #${order._id} for ${product.name}`
    });

    const buyerNotification = new Notification({
      user: userId,
      title: 'Order Placed Successfully',
      body: `Your order #${order._id} has been placed successfully`
    });

    await Promise.all([
      sellerNotification.save(),
      buyerNotification.save()
    ]);

    res.status(201).json({
      msg: 'Order placed successfully',
      order: {
        _id: order._id,
        status: order.status,
        total: order.total,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price
        },
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    });
  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ 
      msg: 'Failed to place order', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const order = await Order.findOne({ 
      _id: id, 
      user: userId,
      status: { $in: ['pending', 'processing'] }
    });

    if (!order) {
      return res.status(404).json({ 
        msg: 'Order not found or cannot be cancelled' 
      });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Restore product stock if not shipped
    if (order.status !== 'shipped') {
      await Product.findByIdAndUpdate(order.product, {
        $inc: { stock: order.quantity },
        $pull: { orders: order._id }
      });
    }

    // Create notifications
    const sellerNotification = new Notification({
      user: order.seller,
      title: 'Order Cancelled',
      body: `Order #${order._id} has been cancelled by the customer`
    });

    const buyerNotification = new Notification({
      user: userId,
      title: 'Order Cancelled',
      body: `Your order #${order._id} has been cancelled successfully`
    });

    await Promise.all([
      sellerNotification.save(),
      buyerNotification.save()
    ]);

    // Initiate refund if payment was online
    if (order.paymentMethod !== 'cod' && order.razorpayPaymentId) {
      try {
        const refund = await razorpay.payments.refund(
          order.razorpayPaymentId,
          { amount: order.total * 100 } // Amount in paise
        );
        
        order.refundId = refund.id;
        order.refundStatus = refund.status;
        await order.save();
      } catch (refundError) {
        console.error('Refund failed:', refundError);
        // Continue even if refund fails - manual intervention needed
      }
    }

    res.status(200).json({ 
      msg: 'Order cancelled successfully',
      order 
    });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ 
      msg: 'Failed to cancel order', 
      error: err.message 
    });
  }
};