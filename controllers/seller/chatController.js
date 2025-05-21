const Chat = require('../../models/Chat');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Notification = require('../../models/notification');

// =================== GET SELLER CHATS ===================
exports.getSellerChats = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ seller: req.user.userId })
      .populate('customer', 'userName profilePicture')
      .populate('product', 'name price media')
      .sort({ lastMessage: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Chat.countDocuments({ seller: req.user.userId });

    res.status(200).json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      chats
    });
  } catch (err) {
    console.error('Get seller chats error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== GET CHAT MESSAGES ===================
exports.getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      seller: req.user.userId
    })
    .populate('messages.sender', 'userName profilePicture');

    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found or not authorized' });
    }

    res.status(200).json({
      chat
    });
  } catch (err) {
    console.error('Get chat messages error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =================== SEND MESSAGE ===================
exports.sendMessage = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ msg: 'Message content is required' });
  }

  try {
    let chat = await Chat.findOne({
      _id: req.params.chatId,
      seller: req.user.userId
    });

    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found or not authorized' });
    }

    const message = {
      sender: req.user.userId,
      content: content.trim(),
      timestamp: new Date()
    };

    chat.messages.push(message);
    chat.lastMessage = new Date();
    await chat.save();

    // Create notification for customer
    const notification = new Notification({
      user: chat.customer,
      title: 'New Message',
      body: `You have a new message from ${req.user.userName}`
    });
    await notification.save();

    res.status(200).json({
      msg: 'Message sent successfully',
      message
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};