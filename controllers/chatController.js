const mongoose = require('mongoose');
const Message = require('../models/messageModel');
const User = require('../models/User');
const Notification = require('../models/notification');
const admin = require('firebase-admin');

// Helper function to format time ago
const timeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

// Send a new message
exports.sendMessage = async (req, res) => {
  const { recipientId, content } = req.body;
  const senderId = req.user.userId;
  const errors = {};

  if (!recipientId) errors.recipientId = 'Recipient ID is required';
  if (!content) errors.content = 'Message content is required';
  else if (content.length > 1000) errors.content = 'Message cannot exceed 1000 characters';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId),
    ]);

    if (!sender) return res.status(404).json({ errors: { senderId: 'Sender not found' } });
    if (!recipient) return res.status(404).json({ errors: { recipientId: 'Recipient not found' } });

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
    });

    if (recipient.settings?.notifications && recipient.fcmToken) {
      const notificationMessage = {
        notification: {
          title: `New Message from ${sender.fullName}`,
          body: content.length > 100 ? `${content.substring(0, 100)}...` : content,
        },
        data: {
          messageId: message._id.toString(),
          senderId: senderId.toString(),
          recipientId: recipientId.toString(),
          type: 'chat_message',
          timestamp: new Date().toISOString(),
        },
        token: recipient.fcmToken,
        android: {
          notification: {
            sound: 'default',
            channelId: 'chat_channel',
            priority: 'high',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            },
          },
        },
      };

      try {
        console.log('Sending FCM notification to:', recipient.fcmToken);
        await admin.messaging().send(notificationMessage);
        console.log('FCM notification sent successfully');

        await Notification.create({
          user: recipientId,
          title: `New Message from ${sender.fullName}`,
          body: content.length > 100 ? `${content.substring(0, 100)}...` : content,
        });
      } catch (fcmError) {
        console.error('FCM push error:', {
          message: fcmError.message,
          code: fcmError.code,
          token: recipient.fcmToken,
        });
        if (fcmError.code === 'messaging/registration-token-not-registered') {
          console.warn('Clearing invalid FCM token for user:', recipientId);
          await User.findByIdAndUpdate(recipientId, { $unset: { fcmToken: '' } });
        }
      }
    } else {
      console.log('No FCM token or notifications disabled for recipient:', recipientId);
    }

    res.status(201).json({
      msg: 'Message sent successfully',
      message: {
        id: message._id,
        sender: message.sender,
        recipient: message.recipient,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
      },
    });
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ msg: 'Failed to send message', error: err.message });
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  const userId = req.user.userId;
  const { recipientId, page = 1, limit = 20 } = req.query;

  if (!recipientId) {
    return res.status(400).json({ errors: { recipientId: 'Recipient ID is required' } });
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'fullName userName')
      .populate('recipient', 'fullName userName');

    await Message.updateMany(
      {
        sender: recipientId,
        recipient: userId,
        isRead: false,
        isDeleted: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      msg: 'Messages retrieved successfully',
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({
          $or: [
            { sender: userId, recipient: recipientId },
            { sender: recipientId, recipient: userId },
          ],
          isDeleted: false,
        }),
      },
    });
  } catch (err) {
    console.error('Get messages error:', err.message);
    res.status(500).json({ msg: 'Failed to retrieve messages', error: err.message });
  }
};

// Update a message
exports.updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;
  const errors = {};

  if (!content) errors.content = 'Message content is required';
  else if (content.length > 1000) errors.content = 'Message cannot exceed 1000 characters';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false,
    });

    if (!message) {
      return res.status(404).json({ msg: 'Message not found or unauthorized' });
    }

    message.content = content;
    message.updatedAt = new Date();
    await message.save();

    res.status(200).json({
      msg: 'Message updated successfully',
      message: {
        id: message._id,
        sender: message.sender,
        recipient: message.recipient,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
    });
  } catch (err) {
    console.error('Update message error:', err.message);
    res.status(500).json({ msg: 'Failed to update message', error: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.userId;

  try {
    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false,
    });

    if (!message) {
      return res.status(404).json({ msg: 'Message not found or unauthorized' });
    }

    message.isDeleted = true;
    await message.save();

    res.status(200).json({
      msg: 'Message deleted successfully',
    });
  } catch (err) {
    console.error('Delete message error:', err.message);
    res.status(500).json({ msg: 'Failed to delete message', error: err.message });
  }
};

// Get chat list with user details, message count, latest message time, and online status
exports.getChatList = async (req, res) => {
  const userId = req.user.userId;
  const { page = 1, limit = 20 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Aggregate to find unique chat partners and their details
    const chatList = await Message.aggregate([
      // Match messages involving the user (as sender or recipient)
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) },
          ],
          isDeleted: false,
        },
      },
      // Group by chat partner to get latest message and count
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
              '$recipient',
              '$sender',
            ],
          },
          latestMessage: { $max: '$createdAt' },
          messageCount: { $sum: 1 },
          latestMessageContent: { $last: '$content' },
        },
      },
      // Lookup user details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      // Unwind user array
      { $unwind: '$user' },
      // Project relevant fields
      {
        $project: {
          userId: '$user._id',
          fullName: '$user.fullName',
          userName: '$user.userName',
          profilePicture: '$user.profilePicture',
          messageCount: 1,
          latestMessage: 1,
          latestMessageContent: 1,
          isOnline: {
            $gte: [
              '$user.lastActive',
              new Date(Date.now() - 5 * 60 * 1000), // Online if active in last 5 minutes
            ],
          },
        },
      },
      // Sort by latest message
      { $sort: { latestMessage: -1 } },
      // Pagination
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    // Format response with time ago
    const formattedChatList = chatList.map((chat) => ({
      userId: chat.userId,
      fullName: chat.fullName,
      userName: chat.userName,
      profilePicture: chat.profilePicture,
      messageCount: chat.messageCount,
      latestMessage: chat.latestMessage,
      latestMessageContent: chat.latestMessageContent,
      timeAgo: timeAgo(chat.latestMessage),
      isOnline: chat.isOnline,
    }));

    // Get total count for pagination
    const totalChats = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) },
          ],
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
              '$recipient',
              '$sender',
            ],
          },
        },
      },
      { $count: 'total' },
    ]);

    res.status(200).json({
      msg: 'Chat list retrieved successfully',
      chats: formattedChatList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalChats.length > 0 ? totalChats[0].total : 0,
      },
    });
  } catch (err) {
    console.error('Get chat list error:', err.message);
    res.status(500).json({ msg: 'Failed to retrieve chat list', error: err.message });
  }
};