const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

chatSchema.index({ seller: 1, customer: 1, lastMessage: -1 });
chatSchema.index({ customer: 1, lastMessage: -1 });

module.exports = mongoose.model('Chat', chatSchema);