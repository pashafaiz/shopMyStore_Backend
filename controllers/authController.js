// const User = require('../models/User');
// const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// require('dotenv').config(); 
// const jwt = require('jsonwebtoken');
// const PendingUser = require('../models/PendingUser');

// // =================== EMAIL TRANSPORTER ===================
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // =================== SIGNUP ===================
// exports.signup = async (req, res) => {
//   const { userType, fullName, userName, email, phoneNumber, password, confirmPassword } = req.body;
//   const errors = {};

//   // Validations
//   if (!userType) errors.userType = 'Please select user type (seller or customer)';
//   if (!fullName) errors.fullName = 'Full Name is required';
//   if (!userName) {
//     errors.userName = 'Username is required';
//   } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{3,15}$/.test(userName)) {
//     errors.userName = 'Username must be 3-15 characters, contain at least one letter and one number, with no spaces or special characters';
//   }
//   if (!email) {
//     errors.email = 'Email is required';
//   } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//     errors.email = 'Please enter a valid email address';
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
//     // Check if email already exists in User collection
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ errors: { email: 'Email already in use' } });
//     }

//     // Check if username exists in either User or PendingUser collections (case insensitive)
//     const existingUsername = await User.findOne({ 
//       userName: { $regex: new RegExp(`^${userName}$`, 'i') } 
//     });
    
//     const pendingUsername = await PendingUser.findOne({ 
//       userName: { $regex: new RegExp(`^${userName}$`, 'i') } 
//     });

//     if (existingUsername || pendingUsername) {
//       return res.status(400).json({ errors: { userName: 'Username already taken' } });
//     }

//     // Delete any existing pending user with same email
//     await PendingUser.deleteOne({ email: email.toLowerCase() });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // Create new pending user
//     const newPendingUser = await PendingUser.create({
//       userType,
//       fullName,
//       userName: userName.toLowerCase(),
//       email: email.toLowerCase(),
//       phoneNumber,
//       password: hashedPassword,
//       otp,
//       otpExpires
//     });

//     // Send OTP to the provided email address
//     const mailOptions = {
//       from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
//       to: email.toLowerCase(),
//       subject: `ShopMyStore OTP Verification Code`,
//       html: `
//         <div style="font-family: Arial, sans-serif;">
//           <h1 style="color:rgb(245, 71, 88);">ShopMyStore</h1>
//           <h2>Your OTP is: <strong>${otp}</strong></h2>
//           <p>This OTP is valid for <strong>10 minutes</strong>.</p>
//           <p>If you didn't request this, please ignore this email.</p>
//         </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ 
//       msg: 'OTP sent to your email. Please verify to complete signup.',
//       email: newPendingUser.email 
//     });

//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ 
//       msg: 'Signup failed', 
//       error: err.message,
//       systemError: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// };

// // =================== OTP VERIFY ===================
// exports.verifyOtp = async (req, res) => {
//   const { otp } = req.body;

//   try {
//     if (!otp) return res.status(400).json({ errors: { otp: 'OTP is required' } });

//     const pendingUser = await PendingUser.findOne({ otp });
//     if (!pendingUser) {
//       return res.status(400).json({ errors: { otp: 'Invalid OTP' } });
//     }

//     // DEBUG: Log the pending user to verify userType exists
//     console.log('Pending User Data:', {
//       id: pendingUser._id,
//       userType: pendingUser.userType,
//       email: pendingUser.email
//     });

//     if (pendingUser.otpExpires < new Date()) {
//       await PendingUser.deleteOne({ _id: pendingUser._id });
//       return res.status(400).json({ errors: { otp: 'OTP has expired. Please sign up again' } });
//     }

//     // Create user with explicit userType
//     const userData = {
//       userType: pendingUser.userType, // This must come from pendingUser
//       fullName: pendingUser.fullName,
//       userName: pendingUser.userName,
//       email: pendingUser.email,
//       phoneNumber: pendingUser.phoneNumber,
//       password: pendingUser.password
//     };

//     console.log('Creating user with:', userData); // Debug log

//     const user = await User.create(userData);

//     await PendingUser.deleteOne({ _id: pendingUser._id });

//     const token = jwt.sign(
//       { userId: user._id, email: user.email, userType: user.userType },
//       process.env.JWT_SECRET,
//       { expiresIn: '2d' }
//     );

//     res.status(201).json({
//       msg: 'Account verified and created successfully',
//       token,
//       user: {
//         id: user._id,
//         userType: user.userType,
//         fullName: user.fullName,
//         userName: user.userName,
//         email: user.email,
//         phoneNumber: user.phoneNumber
//       }
//     });

//   } catch (err) {
//     console.error("❌ Full error in verifyOtp:", {
//       message: err.message,
//       stack: err.stack,
//       validationErrors: err.errors
//     });

//     if (err.name === 'ValidationError') {
//       const details = {};
//       for (const field in err.errors) {
//         details[field] = err.errors[field].message;
//       }
//       return res.status(400).json({ 
//         msg: 'Validation failed',
//         error: err.message,
//         details: details
//       });
//     }

//     res.status(500).json({ 
//       msg: 'Failed to verify OTP', 
//       error: err.message
//     });
//   }
// };

// // =================== LOGIN ===================
// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   const errors = {};

//   // Updated email validation to accept any valid email (not just Gmail)
//   if (!email) errors.email = 'Email is required';
//   else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//     errors.email = 'Please enter a valid email address';
//   }

//   if (!password) errors.password = 'Password is required';
//   else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%#?&]{6,}$/.test(password)) {
//     errors.password = 'Password must contain a letter, number, special character and be at least 6 characters';
//   }

//   if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ errors: { email: 'Email is incorrect' } });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ errors: { password: 'Password is incorrect' } });

//     // Include userType in the JWT token payload
//     const token = jwt.sign(
//       { 
//         userId: user._id, 
//         email: user.email,
//         userType: user.userType // Added userType to token
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '2d' } 
//     );

//     // Include userType in the response
//     const { _id, fullName, userName, email: userEmail, phoneNumber, userType } = user;

//     res.status(200).json({
//       msg: 'Login successful',
//       token,
//       user: { 
//         id: _id, 
//         userType, // Added userType here
//         fullName, 
//         userName, 
//         email: userEmail, 
//         phoneNumber 
//       }
//     });

//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ 
//       msg: 'Login failed', 
//       error: err.message,
//       systemError: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// };

// // =================== EDIT PROFILE ===================
// exports.editProfile = async (req, res) => {
//   const userId = req.user.userId;
//   const { fullName, userName } = req.body;
//   const errors = {};

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

//     const existingUser = await User.findOne({
//       userName: { $regex: `^${userName}$`, $options: 'i' },
//       _id: { $ne: userId }
//     });

//     if (existingUser) return res.status(400).json({ errors: { userName: 'Username already taken' } });

//     // Only update the fields we want to change
//     const updates = {
//       fullName: fullName || user.fullName,  // Use existing value if not provided
//       userName: userName
//     };

//     // Use findByIdAndUpdate with { new: true } to return the updated document
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $set: updates },
//       { new: true, runValidators: true }
//     ).select('-password'); // Exclude password from the returned user object

//     res.status(200).json({
//       msg: 'Profile updated successfully',
//       user: {
//         id: updatedUser._id,
//         fullName: updatedUser.fullName,
//         userName: updatedUser.userName,
//         email: updatedUser.email,
//         phoneNumber: updatedUser.phoneNumber
//       }
//     });
//   } catch (err) {
//     console.error("Edit profile error:", err);
//     res.status(500).json({ msg: 'Failed to update profile', error: err.message });
//   }
// };

// // =================== RESEND OTP ===================
// exports.resendOtp = async (req, res) => {
//   const { email } = req.body;

//   if (!email) return res.status(400).json({ errors: { email: 'Email is required' } });

//   try {
//     const user = await PendingUser.findOne({ email });
//     if (!user) return res.status(404).json({ errors: { email: 'Pending user not found or already verified' } });

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
//         <div style="font-family: Arial, sans-serif;">
//           <h3>OTP: <strong>${otp}</strong></h3>
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

// // =================== DISABLED ROUTE ===================
// exports.sendOtp = (req, res) => {
//   res.status(403).json({ msg: 'This route is disabled. OTP is sent during signup only.' });
// };

// // =================== VERIFY TOKEN MIDDLEWARE ===================
// exports.verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ msg: 'Authorization token missing or invalid' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ msg: 'Token is not valid', error: err.message });
//   }
// };

// // =================== GET COMPLETE USER PROFILE ===================
// exports.getCompleteUserProfile = async (req, res) => {
//   const { id } = req.params;


//   try {
//     const user = await User.findById(id)
//       .select('-password -otp -otpExpires')
//       .populate({
//         path: 'products',
//         select: 'name price description media createdAt',
//         options: { sort: { createdAt: -1 } }
//       })
//       .populate({
//         path: 'reels',
//         select: 'videoUrl caption createdAt',
//         options: { sort: { createdAt: -1 } }
//       });

//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     res.status(200).json({
//       msg: 'Complete user profile retrieved successfully',
//       user
//     });
//   } catch (err) {
//     console.error("Get complete user profile error:", err);
//     res.status(500).json({ 
//       msg: 'Failed to get complete user profile', 
//       error: err.message
//     });
//   }
// };



const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config(); 
const jwt = require('jsonwebtoken');
const PendingUser = require('../models/PendingUser');

// =================== EMAIL TRANSPORTER ===================
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
  const { userType, fullName, userName, email, phoneNumber, password, confirmPassword } = req.body;
  const errors = {};

  // Validations
  if (!userType) errors.userType = 'Please select user type (seller or customer)';
  if (!fullName) errors.fullName = 'Full Name is required';
  if (!userName) {
    errors.userName = 'Username is required';
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{3,15}$/.test(userName)) {
    errors.userName = 'Username must be 3-15 characters, contain at least one letter and one number, with no spaces or special characters';
  }
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
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
    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ errors: { email: 'Email already in use' } });
    }

    // Check if username exists in either User or PendingUser collections (case insensitive)
    const existingUsername = await User.findOne({ 
      userName: { $regex: new RegExp(`^${userName}$`, 'i') } 
    });
    
    const pendingUsername = await PendingUser.findOne({ 
      userName: { $regex: new RegExp(`^${userName}$`, 'i') } 
    });

    if (existingUsername || pendingUsername) {
      return res.status(400).json({ errors: { userName: 'Username already taken' } });
    }

    // Delete any existing pending user with same email
    await PendingUser.deleteOne({ email: email.toLowerCase() });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new pending user
    const newPendingUser = await PendingUser.create({
      userType,
      fullName,
      userName: userName.toLowerCase(),
      email: email.toLowerCase(),
      phoneNumber,
      password: hashedPassword,
      otp,
      otpExpires
    });

    // Send OTP to the provided email address
    const mailOptions = {
      from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
      to: email.toLowerCase(),
      subject: `ShopMyStore OTP Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color:rgb(245, 71, 88);">ShopMyStore</h1>
          <h2>Your OTP is: <strong>${otp}</strong></h2>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      msg: 'OTP sent to your email. Please verify to complete signup.',
      email: newPendingUser.email 
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ 
      msg: 'Signup failed', 
      error: err.message,
      systemError: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// =================== OTP VERIFY ===================
exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;

  try {
    if (!otp) return res.status(400).json({ errors: { otp: 'OTP is required' } });

    const pendingUser = await PendingUser.findOne({ otp });
    if (!pendingUser) {
      return res.status(400).json({ errors: { otp: 'Invalid OTP' } });
    }

    // DEBUG: Log the pending user to verify userType exists
    console.log('Pending User Data:', {
      id: pendingUser._id,
      userType: pendingUser.userType,
      email: pendingUser.email
    });

    if (pendingUser.otpExpires < new Date()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(400).json({ errors: { otp: 'OTP has expired. Please sign up again' } });
    }

    // Create user with explicit userType
    const userData = {
      userType: pendingUser.userType, // This must come from pendingUser
      fullName: pendingUser.fullName,
      userName: pendingUser.userName,
      email: pendingUser.email,
      phoneNumber: pendingUser.phoneNumber,
      password: pendingUser.password
    };

    console.log('Creating user with:', userData); // Debug log

    const user = await User.create(userData);

    await PendingUser.deleteOne({ _id: pendingUser._id });

    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    res.status(201).json({
      msg: 'Account verified and created successfully',
      token,
      user: {
        id: user._id,
        userType: user.userType,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (err) {
    console.error("❌ Full error in verifyOtp:", {
      message: err.message,
      stack: err.stack,
      validationErrors: err.errors
    });

    if (err.name === 'ValidationError') {
      const details = {};
      for (const field in err.errors) {
        details[field] = err.errors[field].message;
      }
      return res.status(400).json({ 
        msg: 'Validation failed',
        error: err.message,
        details: details
      });
    }

    res.status(500).json({ 
      msg: 'Failed to verify OTP', 
      error: err.message
    });
  }
};

// =================== LOGIN ===================
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const errors = {};

  // Updated email validation to accept any valid email
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
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

    // Include userType in the JWT token payload
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        userType: user.userType
      },
      process.env.JWT_SECRET,
      { expiresIn: '2d' } 
    );

    // Include userType in the response
    // const { _id, fullName, userName, email: userEmail, phoneNumber, userType } = user;

    const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.Otp;
  delete userResponse.otpExpires;
  delete userResponse.__v;

  res.status(200).json({
    msg: 'Login successful',
    token,
    user: userResponse
  });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      msg: 'Login failed', 
      error: err.message,
      systemError: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// =================== EDIT PROFILE ===================
exports.editProfile = async (req, res) => {
  const userId = req.user.userId;
  const { fullName, userName } = req.body;
  const errors = {};

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
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const existingUser = await User.findOne({
      userName: { $regex: `^${userName}$`, $options: 'i' },
      _id: { $ne: userId }
    });

    if (existingUser) return res.status(400).json({ errors: { userName: 'Username already taken' } });

    // Only update the fields we want to change
    const updates = {
      fullName: fullName || user.fullName,
      userName: userName
    };

    // Use findByIdAndUpdate with { new: true } to return the updated document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      msg: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        userName: updatedUser.userName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber
      }
    });
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ msg: 'Failed to update profile', error: err.message });
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

// =================== DISABLED ROUTE ===================
exports.sendOtp = (req, res) => {
  res.status(403).json({ msg: 'This route is disabled. OTP is sent during signup only.' });
};

// =================== VERIFY TOKEN MIDDLEWARE ===================
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid', error: err.message });
  }
};

// =================== GET COMPLETE USER PROFILE ===================
exports.getCompleteUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id)
      .select('-password -otp -otpExpires')
      .populate({
        path: 'products',
        select: 'name price description media createdAt',
        options: { sort: { createdAt: -1 } }
      })
      .populate({
        path: 'reels',
        select: 'videoUrl caption createdAt',
        options: { sort: { createdAt: -1 } }
      });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({
      msg: 'Complete user profile retrieved successfully',
      user
    });
  } catch (err) {
    console.error("Get complete user profile error:", err);
    res.status(500).json({ 
      msg: 'Failed to get complete user profile', 
      error: err.message
    });
  }
};

// =================== FORGOT PASSWORD ===================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const errors = {};

  // Email validation
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ errors: { email: 'Email not found' } });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP and expiration
    user.Otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
      to: email.toLowerCase(),
      subject: `ShopMyStore Password Reset OTP`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color:rgb(245, 71, 88);">ShopMyStore</h1>
          <h2>Your Password Reset OTP is: <strong>${otp}</strong></h2>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      msg: 'OTP sent to your email for password reset.',
      email: user.email 
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ 
      msg: 'Failed to process forgot password request', 
      error: err.message,
      systemError: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// =================== VERIFY PASSWORD RESET OTP ===================
exports.verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  const errors = {};

  // Validations
  if (!email) errors.email = 'Email is required';
  if (!otp) errors.otp = 'OTP is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      Otp: otp 
    });

    if (!user) {
      return res.status(400).json({ errors: { otp: 'Invalid OTP or email' } });
    }

    if (user.otpExpires < new Date()) {
      user.Otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(400).json({ errors: { otp: 'OTP has expired. Please request a new one' } });
    }

    // Generate a reset token
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Clear OTP fields
    user.Otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      msg: 'OTP verified successfully',
      resetToken
    });

  } catch (err) {
    console.error("Verify password reset OTP error:", err);
    res.status(500).json({ 
      msg: 'Failed to verify OTP', 
      error: err.message
    });
  }
};

// =================== RESET PASSWORD ===================
exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;
  const errors = {};

  // Validations
  if (!resetToken) errors.resetToken = 'Reset token is required';
  if (!newPassword) {
    errors.newPassword = 'New password is required';
  } else if (!/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(newPassword)) {
    errors.newPassword = 'Password must be at least 8 characters, include a number, a letter, and a special character';
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password directly using findByIdAndUpdate to avoid pre-save hook
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ msg: 'Password reset successfully' });

  } catch (err) {
    console.error("Reset password error:", err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Reset token has expired' });
    }
    res.status(500).json({ 
      msg: 'Failed to reset password', 
      error: err.message
    });
  }
};




// =================== SELECT ROLE ===================
exports.selectRole = async (req, res) => {
  const { email, userType } = req.body;
  const errors = {};

  // Validations
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!userType) {
    errors.userType = 'User type is required';
  } else if (!['seller', 'customer'].includes(userType)) {
    errors.userType = 'Invalid user type';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ errors: { email: 'Email already in use' } });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to pending user
    const pendingUser = await PendingUser.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        email: email.toLowerCase(),
        userType,
        otp,
        otpExpires
      },
      { upsert: true, new: true }
    );

    // Send OTP email
    const mailOptions = {
      from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
      to: email.toLowerCase(),
      subject: `ShopMyStore OTP Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color:rgb(245, 71, 88);">ShopMyStore</h1>
          <h2>Your OTP is: <strong>${otp}</strong></h2>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      msg: 'OTP sent to your email. Please verify to continue.',
      email: pendingUser.email,
      userType: pendingUser.userType
    });

  } catch (err) {
    console.error("Select role error:", err);
    res.status(500).json({ 
      msg: 'Failed to select role', 
      error: err.message
    });
  }
};

// =================== SELLER SIGNUP ===================
exports.sellerSignup = async (req, res) => {
  const { 
    email, 
    otp,
    fullName, 
    userName, 
    phoneNumber, 
    password, 
    confirmPassword,
    businessName,
    gstNumber,
    panNumber,
    bankDetails,
    businessAddress
  } = req.body;

  const errors = {};

  // Validations
  if (!email) errors.email = 'Email is required';
  if (!otp) errors.otp = 'OTP is required';
  if (!fullName) errors.fullName = 'Full Name is required';
  if (!userName) {
    errors.userName = 'Username is required';
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{3,15}$/.test(userName)) {
    errors.userName = 'Username must be 3-15 characters, contain at least one letter and one number';
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
  if (!businessName) errors.businessName = 'Business name is required';
  if (!gstNumber) errors.gstNumber = 'GST number is required';
  if (!panNumber) errors.panNumber = 'PAN number is required';
  if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifscCode) {
    errors.bankDetails = 'Bank details are incomplete';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Verify OTP and get pending user
    const pendingUser = await PendingUser.findOne({ 
      email: email.toLowerCase(),
      otp,
      userType: 'seller'
    });

    if (!pendingUser) {
      return res.status(400).json({ errors: { otp: 'Invalid OTP or email' } });
    }

    if (pendingUser.otpExpires < new Date()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(400).json({ errors: { otp: 'OTP has expired. Please start again' } });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ 
      userName: { $regex: new RegExp(`^${userName}$`, 'i') } 
    });
    
    if (existingUsername) {
      return res.status(400).json({ errors: { userName: 'Username already taken' } });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller user
    const userData = {
      userType: 'seller',
      fullName,
      userName: userName.toLowerCase(),
      email: email.toLowerCase(),
      phoneNumber,
      password: hashedPassword,
      businessName,
      gstNumber,
      panNumber,
      bankDetails,
      businessAddress
    };

    const user = await User.create(userData);
    await PendingUser.deleteOne({ _id: pendingUser._id });

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        userType: user.userType
      },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    // Return complete user data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.Otp;
    delete userResponse.otpExpires;
    delete userResponse.__v;

    res.status(201).json({
      msg: 'Seller account created successfully',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error("Seller signup error:", err);
    res.status(500).json({ 
      msg: 'Failed to create seller account', 
      error: err.message
    });
  }
};