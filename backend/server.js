require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const artisanRoutes = require('./routes/artisans');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const truthmarkRoutes = require('./routes/truthmark');
const ipshieldRoutes = require('./routes/ipshield');
const uploadRoutes = require('./routes/upload');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5001;

// ── 1. Secure HTTP Headers ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ── 2. DDoS Protection (Rate Limiting) ──
// Limit each IP to 200 API requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many backend requests from this IP, please try again after 15 minutes" }
});
app.use('/api/', apiLimiter);

// ── 3. Standard Middleware ──
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'] }));


app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hastkala')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/truthmark', truthmarkRoutes);
app.use('/api/verify', truthmarkRoutes);
app.use('/api/ipshield', ipshieldRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static files for QR codes and uploads
app.use('/qrcodes', express.static(path.join(__dirname, 'qrcodes')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Hastkala API is running...');
});

// ── 4. Centralized Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('🔥 [Global Error Handler]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    // Hide sensitive stack traces if in production mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process or use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
