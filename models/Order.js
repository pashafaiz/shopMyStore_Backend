const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String },
    address: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      alternatePhone: { type: String },
    },
    seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'upi', 'net_banking', 'wallet', 'cod'],
    },
    promoCode: { type: String, default: null },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);