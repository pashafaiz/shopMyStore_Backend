const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    enum: ['Individual', 'Partnership', 'Private Limited', 'Public Limited', 'Other'],
    required: true
  },
  gstNumber: {
    type: String,
    trim: true
  },
  panNumber: {
    type: String,
    trim: true,
    required: true
  },
  businessAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  bankDetails: {
    accountNumber: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    ifscCode: { type: String, required: true },
    branch: { type: String }
  },
  businessDescription: {
    type: String,
    maxlength: 500
  },
  businessLogo: {
    type: String,
    default: ''
  },
  businessDocuments: [{
    documentType: { type: String, required: true },
    documentUrl: { type: String, required: true },
    verified: { type: Boolean, default: false }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

sellerProfileSchema.index({ user: 1 });
sellerProfileSchema.index({ businessName: 'text', businessDescription: 'text' });

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);