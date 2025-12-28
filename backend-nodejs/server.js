// ============================================
// TUSSLES Backend Server
// File: backend/server.js
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ordersRouter = require('./routes/orders');
const supabase = require('./config/supabase'); // Initialize Supabase once at startup

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://your-vercel-app.vercel.app', // Replace with your actual Vercel domain
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tussles API is running' });
});

// Enhanced health check with environment variables
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Tussles Backend API is running',
    timestamp: new Date().toISOString(),
    env_check: {
      has_supabase_url: !!process.env.SUPABASE_URL,
      has_supabase_key: !!process.env.SUPABASE_ANON_KEY,
      node_env: process.env.NODE_ENV || 'development'
    }
  });
});

// Routes
app.use('/api/orders', ordersRouter);

// Companies route (simple proxy to orders router for now)
app.get('/api/companies', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum 5MB allowed.'
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Export for Vercel serverless (MUST be before listen)
module.exports = app;

// Start server only when running directly (not on Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Tussles Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}
