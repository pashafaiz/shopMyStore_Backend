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

// Load environment variables
require('dotenv').config();

// Trust Render proxy headers
app.set('trust proxy', true);

app.use(cors({
    origin: '*',
    credentials: true,
  }));

const authRoutes = require('./routes/authRoutes');
const reelRoutes = require('./routes/reelRoutes');

app.use(express.json());
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/auth', reelRoutes);

module.exports = app;