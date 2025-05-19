

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  media: [
    {
      url: {
        type: String,
        required: true,
      },
      mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
  ],
  sizes: [
    {
      type: String,
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  ],
  colors: [
    {
      type: String,
    },
  ],
  highlights: [
    {
      type: String,
    },
  ],
  specifications: [
    {
      name: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  tags: [
    {
      type: String,
    },
  ],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  offer: {
    type: String,
    trim: true,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);