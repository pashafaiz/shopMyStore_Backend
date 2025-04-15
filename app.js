const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const reelRoutes = require('./routes/reelRoutes')

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/auth', reelRoutes)

module.exports = app; 
