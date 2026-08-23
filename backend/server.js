require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const aiRoutes = require('./routes/ai');

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

// ── 4. Routes ──
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Hastkala AI Gateway is running...');
});

// ── 5. Centralized Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('🔥 [Global Error Handler]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
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

