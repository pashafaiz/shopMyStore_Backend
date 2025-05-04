const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');
const connectDB = require('../config/db');
const path = require('path');

// Debug: Check if .env file is being loaded
require('dotenv').config();
console.log('Dotenv config loaded. Checking environment variables...');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  console.log('Current working directory:', process.cwd());
  console.log('Expected .env file path:', path.join(process.cwd(), '.env'));
  process.exit(1);
}

const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'Go to the Login screen, click "Forgot Password," and follow the instructions to reset your password via email.',
  },
  {
    question: 'How can I contact support?',
    answer: 'Use the contact options below to reach us via email or live chat, or submit a ticket for detailed issues.',
  },
  {
    question: 'What is the refund policy?',
    answer: 'Refunds are processed within 7 days for eligible orders. Check our Terms of Service for details.',
  },
];

const seedFAQs = async () => {
  try {
    await connectDB();
    await FAQ.deleteMany({});
    await FAQ.insertMany(faqs);
    console.log('FAQs seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding FAQs:', err);
    process.exit(1);
  }
};

seedFAQs();