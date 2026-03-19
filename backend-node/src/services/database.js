const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'database', 'sca.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Profiles table
    db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        full_name TEXT,
        initials TEXT,
        phone TEXT,
        dob TEXT,
        skills TEXT,
        avatar_filename TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Resumes table
    db.run(`
      CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        file_path TEXT,
        filename TEXT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Resume skills table
    db.run(`
      CREATE TABLE IF NOT EXISTS resume_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resume_id INTEGER,
        skill TEXT,
        frequency INTEGER DEFAULT 1,
        FOREIGN KEY (resume_id) REFERENCES resumes(id)
      )
    `);

    // Predictions table
    db.run(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        prediction_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Meeting requests table (for chatbot)
    db.run(`
      CREATE TABLE IF NOT EXISTS meeting_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        preferred_time TEXT NOT NULL,
        meet_link TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: add meet_link column if missing (older DB versions)
    db.all(`PRAGMA table_info(meeting_requests)`, (err, cols) => {
      if (!err && cols && !cols.find(c => c.name === 'meet_link')) {
        db.run(`ALTER TABLE meeting_requests ADD COLUMN meet_link TEXT`, (alterErr) => {
          if (!alterErr) console.log('✅ Added meet_link column to meeting_requests');
        });
      }
    });

    // Chat history table (Module 8: LLM Chatbot)
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        intent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Skill gap results table (Module 6: Skill Gap Analysis)
    db.run(`
      CREATE TABLE IF NOT EXISTS skill_gap_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        predicted_role TEXT NOT NULL,
        user_skills TEXT NOT NULL,
        missing_skills TEXT NOT NULL,
        gap_percentage REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Learning paths table (Module 7: Course Recommendation)
    db.run(`
      CREATE TABLE IF NOT EXISTS learning_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        target_role TEXT NOT NULL,
        recommended_courses TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Assessment results table
    db.run(`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        skill TEXT NOT NULL,
        score INTEGER NOT NULL,
        answers_json TEXT,
        taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Migration: add skills_json column to profiles if missing
    db.all(`PRAGMA table_info(profiles)`, (err, cols) => {
      if (!err && cols && !cols.find(c => c.name === 'skills_json')) {
        db.run(`ALTER TABLE profiles ADD COLUMN skills_json TEXT`, (alterErr) => {
          if (!alterErr) console.log('✅ Added skills_json column to profiles');
        });
      }
    });

    console.log('Database tables initialized');
  });
}

// Promisified database methods
const dbAsync = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

// Database health check — verifies all tables exist and are accessible
async function healthCheck() {
  const requiredTables = [
    'users', 'profiles', 'resumes', 'resume_skills',
    'predictions', 'meeting_requests',
    'chat_history', 'skill_gap_results', 'learning_paths'
  ];

  const results = {};
  for (const table of requiredTables) {
    try {
      const row = await dbAsync.get(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      results[table] = { exists: true, row_count: row.count };
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }

  const allOk = Object.values(results).every(r => r.exists);
  return { status: allOk ? 'healthy' : 'degraded', tables: results };
}

module.exports = { db, dbAsync, healthCheck };
