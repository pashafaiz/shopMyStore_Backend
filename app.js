// const express = require('express');
// const app = express();
// const path = require('path');

// // ⬇️ Add this at the very top
// require('dotenv').config(); 

// // ⬇️ For trusting Render proxy headers (very important)
// app.set('trust proxy', true);

// const authRoutes = require('./routes/authRoutes');
// const reelRoutes = require('./routes/reelRoutes');

// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api/auth', authRoutes);
// app.use('/api/auth', reelRoutes);

// module.exports = app;

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

require('dotenv').config();

app.set('trust proxy', true);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://192.168.1.65:8081',
    'http://10.0.2.2:8081',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const authRoutes = require('./routes/authRoutes');
const reelRoutes = require('./routes/reelRoutes');

app.use(express.json());
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/auth', reelRoutes);

app.get('/api/ping', (req, res) => {
  console.log('Ping request received:', new Date().toISOString());
  res.status(200).json({ msg: 'Server is alive' });
});

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = app;