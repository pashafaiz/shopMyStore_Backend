const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  fullName: String,
  userName: String,
  email: String,
  phoneNumber: String,
  password: String,
  otp: String,
  otpExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('PendingUser', pendingUserSchema);
