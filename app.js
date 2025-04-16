const express = require('express');
const app = express();
const path = require('path');

require('dotenv').config(); 

app.set('trust proxy', true);

const authRoutes = require('./routes/authRoutes');
const reelRoutes = require('./routes/reelRoutes');

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/auth', reelRoutes);

module.exports = app;