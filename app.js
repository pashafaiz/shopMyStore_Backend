const express = require('express');
const app = express();
const path = require('path');

require('dotenv').config();

app.set('trust proxy', true);

const authRoutes = require('./routes/authRoutes');
const reelRoutes = require('./routes/reelRoutes');
const productRoutes = require('./routes/productRoutes');
const supportRoutes = require('./routes/supportRoutes');
const orderRoutes = require('./routes/orderRoutes');


app.use(express.json());
// Static files not needed for Cloudinary, but kept for compatibility
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/products', productRoutes);
app.use('/api/support', supportRoutes); 
app.use('/api/orders', orderRoutes);

module.exports = app;