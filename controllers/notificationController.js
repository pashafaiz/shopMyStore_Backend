const Notification = require('../models/notification');
const User = require('../models/User');

// Create a new notification
exports.createNotification = async (req, res) => {
  const { userId, title, body } = req.body;
  const errors = {};

  if (!userId) errors.userId = 'User ID is required';
  if (!title) errors.title = 'Title is required';
  if (!body) errors.body = 'Body is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errors: { userId: 'User not found' } });
    }

    const notification = await Notification.create({
      user: userId,
      title,
      body,
    });

    res.status(201).json({
      msg: 'Notification created successfully',
      notification: {
        id: notification._id,
        user: notification.user,
        title: notification.title,
        body: notification.body,
        read: notification.read,
        timestamp: notification.timestamp,
      },
    });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({ msg: 'Failed to create notification', error: err.message });
  }
};

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  const userId = req.user.userId; // From verifyToken middleware

  try {
    const notifications = await Notification.find({ user: userId })
      .sort({ read: 1, timestamp: -1 }) // Unread first, then by newest
      .limit(50); // Limit to prevent overload

    res.status(200).json({
      msg: 'Notifications retrieved successfully',
      notifications,
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ msg: 'Failed to retrieve notifications', error: err.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.userId;

  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found or unauthorized' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      msg: 'Notification marked as read',
      notification: {
        id: notification._id,
        user: notification.user,
        title: notification.title,
        body: notification.body,
        read: notification.read,
        timestamp: notification.timestamp,
      },
    });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ msg: 'Failed to mark notification as read', error: err.message });
  }
};

// Delete a specific notification
exports.deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.userId;

  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found or unauthorized' });
    }

    res.status(200).json({
      msg: 'Notification deleted successfully',
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ msg: 'Failed to delete notification', error: err.message });
  }
};

// Clear all notifications for a user
exports.clearNotifications = async (req, res) => {
  const userId = req.user.userId;

  try {
    await Notification.deleteMany({ user: userId });

    res.status(200).json({
      msg: 'All notifications cleared successfully',
    });
  } catch (err) {
    console.error('Clear notifications error:', err);
    res.status(500).json({ msg: 'Failed to clear notifications', error: err.message });
  }
};