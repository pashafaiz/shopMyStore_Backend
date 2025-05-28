const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userType: { type: String, required: true, enum: ["seller", "customer"] },
    fullName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    Otp: { type: String },
    otpExpires: { type: Date },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/your-cloud-name/image/upload/v1620000000/default-profile.png",
    },
    bio: { type: String, maxlength: 150 },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    reels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reel",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isVerified: { type: Boolean, default: false },
    lastActive: { type: Date },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      website: String,
    },
    settings: {
      notifications: { type: Boolean, default: true },
      privateAccount: { type: Boolean, default: false },
    },
    fcmToken: {
      type: String,
      default: null,
    },

    // Seller specific fields
    businessName: { type: String },
    gstNumber: { type: String },
    panNumber: { type: String },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      ifscCode: { type: String },
      branch: { type: String },
    },
    businessAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "India" },
    },
    businessDescription: { type: String },
    businessCategory: { type: String },
    businessLogo: { type: String },
    businessDocuments: [
      {
        documentType: { type: String },
        documentUrl: { type: String },
      },
    ],
    isSellerVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.Otp;
        delete ret.otpExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ userName: 1 });
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });

module.exports = mongoose.model("User", userSchema);
