const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Route imports
const authRoutes = require('./routes/auth');
const schoolRoutes = require('./routes/schools');
const sprayReportRoutes = require('./routes/sprayReports');
const donationRoutes = require('./routes/donations');
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// --- Middleware ---

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS — allow Next.js web app + all origins for mobile
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      // Allow the configured client URL
      const allowedOrigins = [
        process.env.CLIENT_URL || 'http://localhost:3000',
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow all other origins (for mobile app)
      return callback(null, true);
    },
    credentials: true,
  })
);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/spray-reports', sprayReportRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'pilgrim-protect-api',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handler (must be last)
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Pilgrim Protect API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
