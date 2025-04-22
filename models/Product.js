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
  category: {
    type: String,
    required: true,
    enum: ['Assessories', 'Grocery', 'Toys', 'oils', 'Clothes', 'Shoes', 'Trending'],
    default: 'Assessories',
    index: true
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

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);