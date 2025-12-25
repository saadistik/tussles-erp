// ============================================
// VERCEL SERVERLESS ENTRY POINT
// This file MUST export the Express app for Vercel
// Do NOT call app.listen() here
// ============================================

const app = require('./server.js');

// Export for Vercel (Critical for serverless)
module.exports = app;
