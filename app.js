const express = require('express');
const app = express();
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const reelRoutes = require('./routes/reelRoutes');

app.use(express.json());

// Serve uploaded video files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/auth', reelRoutes);

module.exports = app;
