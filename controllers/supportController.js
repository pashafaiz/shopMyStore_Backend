const Ticket = require('../models/Ticket');
const FAQ = require('../models/FAQ');
const ChatMessage = require('../models/ChatMessage');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Submit Ticket
exports.submitTicket = async (req, res) => {
  const { subject, description } = req.body;
  const userId = req.user.userId;

  const errors = {};
  if (!subject) errors.subject = 'Subject is required';
  if (!description) errors.description = 'Description is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const ticket = await Ticket.create({
      userId,
      subject,
      description,
    });

    // Send email notification
    const mailOptions = {
      from: `"ShopMyStore" <${process.env.EMAIL_USER}>`,
      to: 'mfaizpasha104@gmail.com',
      subject: `New Support Ticket: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color:rgb(245, 71, 88);">ShopMyStore</h1>
          <h2>New Support Ticket</h2>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>User ID:</strong> ${userId}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      msg: 'Ticket submitted successfully',
      ticket: {
        id: ticket._id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
      },
    });
  } catch (err) {
    console.error('Error submitting ticket:', err);
    res.status(500).json({ msg: 'Failed to submit ticket', error: err.message });
  }
};

// Get FAQs
exports.getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.status(200).json({
      msg: 'FAQs retrieved successfully',
      faqs,
    });
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    res.status(500).json({ msg: 'Failed to fetch FAQs', error: err.message });
  }
};

// Send Chat Message
exports.sendChatMessage = async (req, res) => {
  const { text } = req.body;
  const userId = req.user.userId;

  const errors = {};
  if (!text) errors.text = 'Message text is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const message = await ChatMessage.create({
      userId,
      text,
      isUser: true,
    });

    // Simulate bot response (you can replace this with actual bot logic)
    const botMessage = await ChatMessage.create({
      userId,
      text: 'Thanks for your message! Our team will get back to you shortly.',
      isUser: false,
    });

    res.status(201).json({
      msg: 'Message sent successfully',
      message: {
        id: message._id,
        text: message.text,
        isUser: message.isUser,
        timestamp: message.createdAt,
      },
      botMessage: {
        id: botMessage._id,
        text: botMessage.text,
        isUser: botMessage.isUser,
        timestamp: botMessage.createdAt,
      },
    });
  } catch (err) {
    console.error('Error sending chat message:', err);
    res.status(500).json({ msg: 'Failed to send message', error: err.message });
  }
};

// Get Chat Messages
exports.getChatMessages = async (req, res) => {
  const userId = req.user.userId;

  try {
    const messages = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .select('text isUser createdAt');

    res.status(200).json({
      msg: 'Chat messages retrieved successfully',
      messages,
    });
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ msg: 'Failed to fetch chat messages', error: err.message });
  }
};