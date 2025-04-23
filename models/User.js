const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  profilePicture: { 
    type: String,
    default: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1620000000/default-profile.png'
  },
  bio: { type: String, maxlength: 150 },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  reels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: { type: Boolean, default: false },
  lastActive: { type: Date },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    website: String
  },
  settings: {
    notifications: { type: Boolean, default: true },
    privateAccount: { type: Boolean, default: false }
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.otp;
      delete ret.otpExpires;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ userName: 1 });
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });



module.exports = mongoose.model('User', userSchema);