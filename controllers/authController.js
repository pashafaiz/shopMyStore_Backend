const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config(); 
const verifyEmail = require('../utils/verifyEmail');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       // smtp.gmail.com
  port: process.env.EMAIL_PORT,       // 587
  secure: false,                      // false for 587
  auth: {
    user: process.env.EMAIL_USER,    // yourgmail@gmail.com
    pass: process.env.EMAIL_PASS     // app password
  }
});
console.log("📧 Sending mail using:", process.env.EMAIL_USER)

exports.signup = async (req, res) => {
  const { fullName, userName, email, phoneNumber, password, confirmPassword } = req.body;

  try {
    // Check if all required fields are present
    if (!fullName || !userName || !email || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({ msg: 'Please fill in all required fields' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already in use' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Create user
    const user = await User.create({
      fullName,
      userName,
      email,
      phoneNumber,
      password: hashedPassword,
      otp,
      otpExpires
    });

    // Send OTP Email
    await transporter.sendMail({
      from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `ShopMyStore Verification Code`,
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Your OTP is: <strong style="font-size: 24px;">${otp}</strong></h2>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
        </div>
      `
    });

    // Respond success
    res.status(201).json({ msg: 'User created. OTP sent.', userId: user._id });

  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ msg: 'Signup failed', error: err.message });
  }
};





const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Login attempt:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token valid for 1 hour
    );

    res.status(200).json({
      msg: 'Login successful',
      token
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ msg: 'Login failed', error: err.message });
  }
};


// exports.sendOtp = async (req, res) => {
//   const { email } = req.body;
//   console.log("👉 Received OTP request for:", email);

//   try {
//     const isValidEmail = await verifyEmail(email);
//     if (!isValidEmail) {
//       return res.status(400).json({ msg: 'Invalid or non-existent email address' });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//     console.log("🔐 Generated OTP:", otp);

//     // 👇 Don't use upsert; only update existing users
//     const user = await User.findOneAndUpdate(
//       { email },
//       { otp, otpExpires },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ msg: 'User not found. Please sign up first.' });
//     }

//     await transporter.sendMail({
//       from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: `ShopMyStore Verification Code`,
//       text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//           <h2 style="color: #333;">Your OTP is: <strong style="font-size: 24px;">${otp}</strong></h2>
//           <p>This OTP is valid for 10 minutes.</p>
//           <p>If you didn’t request this, you can safely ignore this email.</p>
//         </div>
//       `
//     });

//     console.log("✅ OTP email sent successfully.");
//     res.status(200).json({ msg: 'OTP sent successfully' });

//   } catch (err) {
//     console.error("❌ Error in sendOtp:", err);
//     res.status(500).json({ msg: 'Failed to send OTP', error: err.message });
//   }
// };

// Temporarily disable resend route
exports.sendOtp = (req, res) => {
  res.status(403).json({ msg: 'This route is disabled. OTP is sent during signup only.' });
};


  
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ msg: 'OTP was not requested or already verified' });
    }

    // Check if OTP expired
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ msg: 'OTP expired' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // ✅ OTP is valid
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ msg: 'OTP verified successfully' });

  } catch (err) {
    console.error("❌ Error in verifyOtp:", err);
    res.status(500).json({ msg: 'Failed to verify OTP', error: err.message });
  }
};

  
  
