const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config(); 
const jwt = require('jsonwebtoken');
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
console.log("Sending mail using:", process.env.EMAIL_USER)
exports.signup = async (req, res) => {
  const { fullName, userName, email, phoneNumber, password, confirmPassword } = req.body;

  const errors = {};

  if (!fullName) errors.fullName = 'Full Name is required';

  if (!userName) {
    errors.userName = 'Username is required';
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{3,15}$/.test(userName)) {
    errors.userName = 'Username must be 3-15 characters, contain at least one letter and one number, with no spaces or special characters';
  }
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[a-zA-Z]+\d*@gmail\.com$/.test(email)) {
    errors.email = 'Only valid Gmail addresses allowed (e.g. name123@gmail.com)';
  }

  if (!phoneNumber) {
    errors.phoneNumber = 'Phone Number is required';
  } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
    errors.phoneNumber = 'Invalid Indian phone number';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(password)) {
    errors.password = 'Password must be at least 8 characters, include a number, a letter, and a special character';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ errors: { email: 'Email already in use' } });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      fullName,
      userName,
      email,
      phoneNumber,
      password: hashedPassword,
      otp,
      otpExpires
    });

    await transporter.sendMail({
      from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `ShopMyStore OTP Verification Code`,
      text: `${otp} is your ShopMyStore verification code. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1 style="color:rgb(245, 71, 88);">ShopMyStore</h1>
          <h2>Your OTP is: <strong style="font-size: 24px;">${otp}</strong></h2>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <br/>
          <p style="font-size: 14px; color: #888;">Thanks,</p>
          <p style="font-size: 14px; color: #888;">The ShopMyStore Team</p>
        </div>
      `
    });
    

    res.status(201).json({ msg: 'User created. OTP sent.', userId: user._id });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: 'Signup failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email);

  const errors = {};

  // Validate email format
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[a-zA-Z0-9._%+-]+[0-9]*@gmail\.com$/.test(email)) {
    errors.email = 'Invalid email format. Must be a valid Gmail address';
  }

  // Validate password format
  if (!password) {
    errors.password = 'Password is required';
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/.test(password)) {
    errors.password = 'Password must contain a letter, number, special character and be at least 6 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: { email: 'Email is incorrect. Please check your email' } });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ errors: { password: 'Password is incorrect. Please check your password' } });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      msg: 'Login successful',
      token,
    });

  } catch (err) {
    console.error("Login error:", err);
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
  const { otp } = req.body;

  try {
    if (!otp) {
      return res.status(400).json({ errors: { otp: 'OTP is required' } });
    }

    const user = await User.findOne({ otp });

    if (!user) {
      return res.status(400).json({ errors: { otp: 'Invalid OTP or it may have already been used' } });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ errors: { otp: 'OTP has expired. Please request a new one' } });
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ msg: 'OTP verified successfully' });

  } catch (err) {
    console.error("❌ Error in verifyOtp:", err);
    res.status(500).json({ msg: 'Failed to verify OTP', error: err.message });
  }
};

  
  
