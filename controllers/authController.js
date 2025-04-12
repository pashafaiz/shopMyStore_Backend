// const User = require('../models/User');
// const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// require('dotenv').config(); 
// const jwt = require('jsonwebtoken');
// const PendingUser = require('../models/PendingUser');


// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,       // smtp.gmail.com
//   port: process.env.EMAIL_PORT,       // 587
//   secure: false,                      // false for 587
//   auth: {
//     user: process.env.EMAIL_USER,    // yourgmail@gmail.com
//     pass: process.env.EMAIL_PASS     // app password
//   }
// });

// exports.signup = async (req, res) => {
//   const { fullName, userName, email, phoneNumber, password, confirmPassword } = req.body;

//   const errors = {};

//   if (!fullName) errors.fullName = 'Full Name is required';

//   if (!userName) {
//     errors.userName = 'Username is required';
//   } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{3,15}$/.test(userName)) {
//     errors.userName = 'Username must be 3-15 characters, contain at least one letter and one number, with no spaces or special characters';
//   }

//   if (!email) {
//     errors.email = 'Email is required';
//   } else if (!/^[a-zA-Z]+\d*@gmail\.com$/.test(email)) {
//     errors.email = 'Only valid Gmail addresses allowed (e.g. name123@gmail.com)';
//   }

//   if (!phoneNumber) {
//     errors.phoneNumber = 'Phone Number is required';
//   } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
//     errors.phoneNumber = 'Invalid Indian phone number';
//   }

//   if (!password) {
//     errors.password = 'Password is required';
//   } else if (!/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(password)) {
//     errors.password = 'Password must be at least 8 characters, include a number, a letter, and a special character';
//   }

//   if (!confirmPassword) {
//     errors.confirmPassword = 'Confirm Password is required';
//   } else if (password !== confirmPassword) {
//     errors.confirmPassword = 'Passwords do not match';
//   }

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({ errors });
//   }

//   try {
//     // Check if email already exists in verified users
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ errors: { email: 'Email already in use' } });

//     // If a pending user already exists, delete it
//     await PendingUser.deleteOne({ email });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//     // Save to PendingUser
//     await PendingUser.create({
//       fullName,
//       userName,
//       email,
//       phoneNumber,
//       password: hashedPassword,
//       otp,
//       otpExpires
//     });

//     await transporter.sendMail({
//       from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: `ShopMyStore OTP Verification Code`,
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//           <h1 style="color:rgb(245, 71, 88);">ShopMyStore</h1>
//           <h2>Your OTP is: <strong style="font-size: 24px;">${otp}</strong></h2>
//           <p>This OTP is valid for <strong>10 minutes</strong>.</p>
//           <p>If you didn’t request this, you can safely ignore this email.</p>
//         </div>
//       `
//     });

//     res.status(200).json({ msg: 'OTP sent to email. Please verify to complete signup.' });

//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ msg: 'Signup failed', error: err.message });
//   }
// };


// exports.verifyOtp = async (req, res) => {
//   const { otp } = req.body;

//   try {
//     if (!otp) {
//       return res.status(400).json({ errors: { otp: 'OTP is required' } });
//     }

//     const pendingUser = await PendingUser.findOne({ otp });

//     if (!pendingUser) {
//       return res.status(400).json({ errors: { otp: 'Invalid OTP or it may have already been used' } });
//     }

//     if (!pendingUser.otpExpires || pendingUser.otpExpires < new Date()) {
//       return res.status(400).json({ errors: { otp: 'OTP has expired. Please sign up again' } });
//     }

//     // Create verified user
//     const user = await User.create({
//       fullName: pendingUser.fullName,
//       userName: pendingUser.userName,
//       email: pendingUser.email,
//       phoneNumber: pendingUser.phoneNumber,
//       password: pendingUser.password
//     });

//     // Remove from pending list
//     await PendingUser.deleteOne({ email: pendingUser.email });

//     return res.status(201).json({ msg: 'OTP verified and user created successfully', userId: user._id });

//   } catch (err) {
//     console.error("❌ Error in verifyOtp:", err);
//     res.status(500).json({ msg: 'Failed to verify OTP', error: err.message });
//   }
// };


// exports.resendOtp = async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ errors: { email: 'Email is required' } });
//   }

//   try {
//     // Find in pending users instead of registered users
//     const user = await PendingUser.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ errors: { email: 'Pending user not found or already verified' } });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//     user.otp = otp;
//     user.otpExpires = otpExpires;
//     await user.save();

//     await transporter.sendMail({
//       from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: `Your OTP Code ${otp}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//           <h3>OTP: <strong style="font-size: 24px;">${otp}</strong></h3>
//           <p>This OTP will expire in <strong>10 minutes</strong>.</p>
//         </div>
//       `
//     });

//     res.status(200).json({ msg: 'OTP resent successfully' });
//   } catch (err) {
//     console.error("Error in resendOtp:", err);
//     res.status(500).json({ msg: 'Failed to resend OTP', error: err.message });
//   }
// };


// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   console.log("Login attempt:", email);

//   const errors = {};

//   if (!email) {
//     errors.email = 'Email is required';
//   } else if (!/^[a-zA-Z0-9._%+-]+[0-9]*@gmail\.com$/.test(email)) {
//     errors.email = 'Invalid email format. Must be a valid Gmail address';
//   }

//   if (!password) {
//     errors.password = 'Password is required';
//   } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%#?&]{6,}$/.test(password)) {
//     errors.password = 'Password must contain a letter, number, special character and be at least 6 characters';
//   }

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({ errors });
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ errors: { email: 'Email is incorrect. Please check your email' } });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ errors: { password: 'Password is incorrect. Please check your password' } });
//     }

//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // Destructure only the fields you want to send back
//     const { _id, fullName, userName, email: userEmail, phoneNumber } = user;

//     return res.status(200).json({
//       msg: 'Login successful',
//       token,
//       user: {
//         id: _id,
//         fullName,
//         userName,
//         email: userEmail,
//         phoneNumber,
//       }
//     });

//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ msg: 'Login failed', error: err.message });
//   }
// };


// exports.editProfile = async (req, res) => {
//   const userId = req.user.userId; // assuming this comes from JWT middleware
//   const { fullName, userName } = req.body;

//   const errors = {};

//   if (!fullName) errors.fullName = 'Full Name is required';

//   if (!userName) {
//     errors.userName = 'Username is required';
//   } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{3,15}$/.test(userName)) {
//     errors.userName = 'Username must be 3-15 characters, contain at least one letter and one number, with no spaces or special characters';
//   }

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({ errors });
//   }

//   try {
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ msg: 'User not found' });

//     user.fullName = fullName;
//     user.userName = userName;

//     await user.save();

//     res.status(200).json({
//       msg: 'Profile updated successfully',
//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         userName: user.userName,
//         email: user.email,
//         phoneNumber: user.phoneNumber
//       }
//     });
//   } catch (err) {
//     console.error("Edit profile error:", err);
//     res.status(500).json({ msg: 'Failed to update profile', error: err.message });
//   }
// };








// exports.sendOtp = (req, res) => {
//   res.status(403).json({ msg: 'This route is disabled. OTP is sent during signup only.' });
// };


  




const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config(); 
const jwt = require('jsonwebtoken');
const PendingUser = require('../models/PendingUser');

// OTP bhejne ke liye transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// =================== SIGNUP ===================
exports.signup = async (req, res) => {
  const { fullName, userName, email, phoneNumber, password, confirmPassword } = req.body;
  const errors = {};

  // Validations
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
    // Email already taken check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: { email: 'Email already in use' } });
    }

    // Case-insensitive username check in User
    const existingUsername = await User.findOne({ 
      userName: { $regex: `^${userName}$`, $options: 'i' } 
    });

    if (existingUsername) {
      return res.status(400).json({ errors: { userName: 'Username already taken' } });
    }

    // Case-insensitive username check in PendingUser
    const pendingUsername = await PendingUser.findOne({ 
      userName: { $regex: `^${userName}$`, $options: 'i' } 
    });

    if (pendingUsername) {
      return res.status(400).json({ errors: { userName: 'Username already taken' } });
    }

    // Remove old pending user with same email
    await PendingUser.deleteOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min valid

    await PendingUser.create({
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
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color:rgb(245, 71, 88);">ShopMyStore</h1>
          <h2>Your OTP is: <strong>${otp}</strong></h2>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        </div>
      `
    });

    res.status(200).json({ msg: 'OTP sent to email. Please verify to complete signup.' });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: 'Signup failed', error: err.message });
  }
};


// =================== OTP VERIFY ===================
// =================== OTP VERIFY ===================
exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;

  try {
    if (!otp) return res.status(400).json({ errors: { otp: 'OTP is required' } });

    const pendingUser = await PendingUser.findOne({ otp });
    if (!pendingUser) return res.status(400).json({ errors: { otp: 'Invalid OTP or already used' } });

    if (pendingUser.otpExpires < new Date()) {
      return res.status(400).json({ errors: { otp: 'OTP has expired. Please sign up again' } });
    }

    // Create user from pending
    const user = await User.create({
      fullName: pendingUser.fullName,
      userName: pendingUser.userName,
      email: pendingUser.email,
      phoneNumber: pendingUser.phoneNumber,
      password: pendingUser.password
    });

    // Delete pending user entry
    await PendingUser.deleteOne({ email: pendingUser.email });

    // 🔑 Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Return user + token
    res.status(201).json({
      msg: 'OTP verified and user created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (err) {
    console.error("❌ Error in verifyOtp:", err);
    res.status(500).json({ msg: 'Failed to verify OTP', error: err.message });
  }
};


// =================== RESEND OTP ===================
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ errors: { email: 'Email is required' } });

  try {
    const user = await PendingUser.findOne({ email });
    if (!user) return res.status(404).json({ errors: { email: 'Pending user not found or already verified' } });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await transporter.sendMail({
      from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your OTP Code ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h3>OTP: <strong>${otp}</strong></h3>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        </div>
      `
    });

    res.status(200).json({ msg: 'OTP resent successfully' });
  } catch (err) {
    console.error("Error in resendOtp:", err);
    res.status(500).json({ msg: 'Failed to resend OTP', error: err.message });
  }
};

// =================== LOGIN ===================
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email) errors.email = 'Email is required';
  else if (!/^[a-zA-Z0-9._%+-]+[0-9]*@gmail\.com$/.test(email)) {
    errors.email = 'Invalid email format. Must be a valid Gmail address';
  }

  if (!password) errors.password = 'Password is required';
  else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%#?&]{6,}$/.test(password)) {
    errors.password = 'Password must contain a letter, number, special character and be at least 6 characters';
  }

  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errors: { email: 'Email is incorrect' } });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ errors: { password: 'Password is incorrect' } });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const { _id, fullName, userName, email: userEmail, phoneNumber } = user;

    res.status(200).json({
      msg: 'Login successful',
      token,
      user: { id: _id, fullName, userName, email: userEmail, phoneNumber }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: 'Login failed', error: err.message });
  }
};

// =================== EDIT PROFILE ===================
exports.editProfile = async (req, res) => {
  const userId = req.user.userId;
  const { fullName, userName } = req.body;
  const errors = {};

  // Validate only username
  if (!userName) {
    errors.userName = 'Username is required';
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{3,15}$/.test(userName)) {
    errors.userName = 'Username must be 3-15 characters, contain at least one letter and one number, with no spaces or special characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Case-insensitive username check (except current user)
    const existingUser = await User.findOne({
      userName: { $regex: `^${userName}$`, $options: 'i' },
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({ errors: { userName: 'Username already taken' } });
    }

    // Update profile
    user.fullName = fullName;
    user.userName = userName;

    await user.save();

    res.status(200).json({
      msg: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ msg: 'Failed to update profile', error: err.message });
  }
};



// =================== DISABLED ROUTE ===================
exports.sendOtp = (req, res) => {
  res.status(403).json({ msg: 'This route is disabled. OTP is sent during signup only.' });
};
