const Product = require('../models/Product');
const Address = require('../models/Address');
const PromoCode = require('../models/PromoCode');
const Order = require('../models/Order');
const Razorpay = require('razorpay');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Fetch all orders for the authenticated user
exports.getOrders = async (req, res) => {
  const userId = req.user.userId;

  try {
    const orders = await Order.find({ user: userId })
      .populate('product', 'name price media')
      .sort({ createdAt: -1 });
    res.status(200).json({ msg: 'Orders retrieved successfully', orders });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ msg: 'Failed to fetch orders', error: err.message });
  }
};

// Fetch product details
exports.getProductDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).select('name price media');
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(200).json({ msg: 'Product retrieved successfully', product });
  } catch (err) {
    console.error('Get product details error:', err);
    res.status(500).json({ msg: 'Failed to fetch product', error: err.message });
  }
};

// Fetch user addresses
exports.getAddresses = async (req, res) => {
  const userId = req.user.userId;

  try {
    const addresses = await Address.find({ user: userId }).sort({ isDefault: -1 });
    res.status(200).json({ msg: 'Addresses retrieved successfully', addresses });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ msg: 'Failed to fetch addresses', error: err.message });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  const userId = req.user.userId;
  const { address, city, state, zipCode, alternatePhone, isDefault } = req.body;
  const errors = {};

  if (!address) errors.address = 'Street address is required';
  if (!city) errors.city = 'City is required';
  if (!state) errors.state = 'State is required';
  if (!zipCode) errors.zipCode = 'Zip code is required';
  if (alternatePhone && !/^[6-9]\d{9}$/.test(alternatePhone)) {
    errors.alternatePhone = 'Invalid alternate phone number';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: userId,
      address,
      city,
      state,
      zipCode,
      alternatePhone,
      isDefault: isDefault || false,
    });

    res.status(201).json({ msg: 'Address added successfully', address: newAddress });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ msg: 'Failed to add address', error: err.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    await Address.deleteOne({ _id: id });
    if (address.isDefault) {
      const remainingAddress = await Address.findOne({ user: userId });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    res.status(200).json({ msg: 'Address deleted successfully' });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ msg: 'Failed to delete address', error: err.message });
  }
};

// Validate promo code
exports.validatePromoCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ errors: { code: 'Promo code is required' } });
  }

  try {
    const promoCode = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promoCode) {
      return res.status(400).json({ errors: { code: 'Invalid promo code' } });
    }

    if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
      return res.status(400).json({ errors: { code: 'Promo code has expired' } });
    }

    res.status(200).json({
      msg: 'Promo code validated successfully',
      discount: promoCode.discount,
    });
  } catch (err) {
    console.error('Validate promo code error:', err);
    res.status(500).json({ msg: 'Failed to validate promo code', error: err.message });
  }
};

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.status(200).json({
      msg: 'Razorpay order created successfully',
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (err) {
    console.error('Create Razorpay order error:', err);
    res.status(500).json({ msg: 'Failed to create Razorpay order', error: err.message });
  }
};

// Place order
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

  if (!productId) errors.productId = 'Product ID is required';
  if (!quantity || quantity < 1) errors.quantity = 'Quantity must be at least 1';
  if (!address || !address.address || !address.city || !address.state || !address.zipCode) {
    errors.address = 'Complete address is required';
  }
  if (address.alternatePhone && !/^[6-9]\d{9}$/.test(address.alternatePhone)) {
    errors.alternatePhone = 'Invalid alternate phone number';
  }
  if (!paymentMethod || !['credit_card', 'upi', 'net_banking', 'wallet', 'cod'].includes(paymentMethod)) {
    errors.paymentMethod = 'Invalid payment method';
  }
  if (!total || total < 0) errors.total = 'Total must be a positive number';

  if (paymentMethod !== 'cod' && (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)) {
    errors.razorpay = 'Razorpay payment details are required for online payments';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    let discount = 0;
    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (!promo) {
        return res.status(400).json({ msg: 'Invalid promo code' });
      }
      if (promo.expiresAt && promo.expiresAt < new Date()) {
        return res.status(400).json({ msg: 'Promo code has expired' });
      }
      discount = promo.discount;
    }

    const subtotal = product.price * quantity;
    const shipping = 50;
    const tax = subtotal * 0.05;
    const discountAmount = subtotal * (discount / 100);
    const calculatedTotal = (subtotal + shipping + tax - discountAmount).toFixed(2);

    if (parseFloat(total).toFixed(2) !== calculatedTotal) {
      console.log('Total mismatch details:', {
        providedTotal: total,
        calculatedTotal,
        subtotal,
        shipping,
        tax,
        discount,
        discountAmount,
      });
      return res.status(400).json({ msg: 'Total mismatch' });
    }

    // For online payments, verify Razorpay payment
    if (paymentMethod !== 'cod') {
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        console.log('Razorpay signature verification failed:', {
          generatedSignature,
          providedSignature: razorpaySignature,
        });
        return res.status(400).json({ msg: 'Invalid Razorpay payment signature' });
      }
    }

    const order = await Order.create({
      user: userId,
      product: productId,
      quantity,
      size,
      color,
      address,
      paymentMethod,
      promoCode: promoCode || null,
      discount,
      subtotal,
      shipping,
      tax,
      total: calculatedTotal,
      razorpayOrderId: paymentMethod !== 'cod' ? razorpayOrderId : null,
      razorpayPaymentId: paymentMethod !== 'cod' ? razorpayPaymentId : null,
      razorpaySignature: paymentMethod !== 'cod' ? razorpaySignature : null, // Save the signature
    });

    res.status(201).json({
      msg: 'Order placed successfully',
      order: {
        _id: order._id,
        user: order.user,
        product: order.product,
        quantity: order.quantity,
        total: order.total,
        status: order.status,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        razorpaySignature: order.razorpaySignature, // Include signature in response
      },
    });
  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ msg: 'Failed to place order', error: err.message });
  }
};