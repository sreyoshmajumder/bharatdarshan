/**
 * server.js — Local development entry point.
 * Imports the Express app from app.js and calls app.listen().
 * On Vercel, app.js is used directly via api/index.js.
 */
const app = require('./app');
const { initDb } = require('./db');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`\n🗺️  BharatDarshan API running at http://localhost:${PORT}`);
    console.log(`📚  Health check: http://localhost:${PORT}/health\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
