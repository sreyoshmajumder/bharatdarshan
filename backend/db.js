const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// Vercel serverless: only /tmp is writable at runtime.
// Local dev: use the backend directory.
const DB_PATH = process.env.NODE_ENV === 'production'
  ? path.join(os.tmpdir(), 'bharatdarshan.db')
  : path.join(__dirname, 'bharatdarshan.db');

let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) console.error('DB connection error:', err);
      else console.log('✅ Connected to SQLite database');
    });
    db.run('PRAGMA journal_mode=WAL;');
    db.run('PRAGMA foreign_keys=ON;');
  }
  return db;
}

function initDb() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.serialize(() => {
      // Users table
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          avatar_emoji TEXT DEFAULT '🧭',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        )
      `);

      // User visit log
      database.run(`
        CREATE TABLE IF NOT EXISTS visit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          state_id TEXT,
          place_name TEXT,
          visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Heritage site proximity alerts
      database.run(`
        CREATE TABLE IF NOT EXISTS heritage_alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          site_id TEXT,
          site_name TEXT,
          alerted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      database.run('SELECT 1', (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Database initialized');
          resolve();
        }
      });
    });
  });
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = { initDb, runQuery, getOne, getAll };
