/**
 * backend/app.js
 * Express app exported WITHOUT calling app.listen().
 * Used by:
 *   - api/index.js  → Vercel serverless deployment
 *   - server.js     → local development (calls app.listen())
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const statesRoutes    = require('./routes/states');
const locationsRoutes = require('./routes/locations');
const weatherRoutes   = require('./routes/weather');
const newsRoutes      = require('./routes/news');
const wikiRoutes      = require('./routes/wiki');
const hotelsRoutes    = require('./routes/hotels');

const app = express();

// ── Middleware ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^https?:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) ||
      (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN)
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed: ' + origin));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ──
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ──
app.use('/api/auth',      authRoutes);
app.use('/api/states',    statesRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/weather',   weatherRoutes);
app.use('/api/news',      newsRoutes);
app.use('/api/wiki',      wikiRoutes);
app.use('/api/hotels',    hotelsRoutes);

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BharatDarshan API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
