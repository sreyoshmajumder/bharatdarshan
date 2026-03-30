/**
 * api/index.js — Vercel Serverless Function Entry Point
 *
 * This file exports the Express app as a Vercel serverless function.
 * All requests to /api/* are handled here.
 *
 * Vercel automatically catches all /api/* routes to this file because
 * it's in the /api directory at the project root.
 */
const app    = require('../backend/app');
const { initDb } = require('../backend/db');

// Initialize DB once (warm lambda reuses this instance)
let dbReady = false;
const ensureDb = async () => {
  if (!dbReady) {
    await initDb();
    dbReady = true;
  }
};

// Vercel serverless handler
module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
