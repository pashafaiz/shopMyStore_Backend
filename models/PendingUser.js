const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true },
  userType: { 
    type: String, 
    required: true,
    enum: ['seller', 'customer']
  }
}, { timestamps: true });

module.exports = mongoose.model('PendingUser', pendingUserSchema);