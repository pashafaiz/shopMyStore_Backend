// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//     quantity: { type: Number, required: true, min: 1 },
//     size: { type: String },
//     color: { type: String },
//     address: {
//       address: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       zipCode: { type: String, required: true },
//       alternatePhone: { type: String },
//     },
//     paymentMethod: {
//       type: String,
//       required: true,
//       enum: ['credit_card', 'upi', 'net_banking', 'wallet', 'cod'],
//     },
//     promoCode: { type: String, default: null },
//     discount: { type: Number, default: 0 },
//     subtotal: { type: Number, required: true },
//     shipping: { type: Number, required: true },
//     tax: { type: Number, required: true },
//     total: { type: Number, required: true },
//     status: {
//       type: String,
//       enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
//       default: 'pending',
//     },
//     razorpayOrderId: { type: String },
//     razorpayPaymentId: { type: String },
//     razorpaySignature: { type: String },
//   },
//   { timestamps: true }
// );

// orderSchema.index({ user: 1, createdAt: -1 });

// module.exports = mongoose.model('Order', orderSchema);







const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
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
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    tracking: {
      trackingId: { type: String },
      carrier: { type: String },
      status: { type: String, enum: ['not_shipped', 'in_transit', 'out_for_delivery', 'delivered'], default: 'not_shipped' },
      updates: [
        {
          status: { type: String },
          location: { type: String },
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
    returnRequest: {
      status: { type: String, enum: ['none', 'requested', 'approved', 'rejected'], default: 'none' },
      reason: { type: String },
      requestedAt: { type: Date },
    },
    refundStatus: {
      status: { type: String, enum: ['none', 'initiated', 'completed', 'failed'], default: 'none' },
      amount: { type: Number, default: 0 },
      refundedAt: { type: Date },
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'tracking.trackingId': 1 });
orderSchema.index({ 'returnRequest.status': 1 });

module.exports = mongoose.model('Order', orderSchema);