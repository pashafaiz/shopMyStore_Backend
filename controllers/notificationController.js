const Notification = require('../models/notification');
const User = require('../models/User');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('../serviceAccountKey.json');
} catch (error) {
  console.error('Failed to load Firebase service account:', error.message);
  throw new Error('Firebase service account configuration missing. Set FIREBASE_SERVICE_ACCOUNT env variable or provide serviceAccountKey.json');
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    throw error;
  }
}

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

    // Check if user has notifications enabled
    if (!user.settings.notifications) {
      console.log('Notifications disabled for user:', userId);
      return res.status(200).json({ msg: 'Notifications disabled for user, skipping creation' });
    }

    const notification = await Notification.create({
      user: userId,
      title,
      body,
    });

    // Send FCM push notification if user has FCM token
    if (user.fcmToken) {
      const message = {
        notification: {
          title,
          body,
        },
        token: user.fcmToken,
      };

      try {
        await admin.messaging().send(message);
        console.log('FCM push sent successfully to:', user.fcmToken);
      } catch (fcmError) {
        console.error('FCM push error:', fcmError.message);
        // Continue even if FCM fails, as DB save was successful
      }
    } else {
      console.warn('No FCM token found for user:', userId);
    }

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
    console.error('Create notification error:', err.message);
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
    console.error('Get notifications error:', err.message);
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
    console.error('Mark as read error:', err.message);
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
    console.error('Delete notification error:', err.message);
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
    console.error('Clear notifications error:', err.message);
    res.status(500).json({ msg: 'Failed to clear notifications', error: err.message });
  }
};

// Save FCM token
exports.saveFcmToken = async (req, res) => {
  const { userId, fcmToken } = req.body;
  const errors = {};

  if (!userId) errors.userId = 'User ID is required';
  if (!fcmToken) errors.fcmToken = 'FCM token is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ errors: { userId: 'User not found' } });
    }

    res.status(200).json({
      msg: 'FCM token saved successfully',
    });
  } catch (err) {
    console.error('Save FCM token error:', err.message);
    res.status(500).json({ msg: 'Failed to save FCM token', error: err.message });
  }
};