import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database.sqlite');

export const db = new sqlite3.Database(dbPath);

export const initializeDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'candidate',
        preferred_position TEXT,
        experience_level TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Interview sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS interview_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        position TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        questions TEXT NOT NULL,
        answers TEXT,
        score INTEGER,
        feedback TEXT,
        duration INTEGER,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Daily challenges table
    db.run(`
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        challenge_date DATE NOT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        score INTEGER,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Scheduled interviews table
    db.run(`
      CREATE TABLE IF NOT EXISTS scheduled_interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id INTEGER,
        guest_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        scheduled_time DATETIME NOT NULL,
        duration INTEGER DEFAULT 60,
        status TEXT DEFAULT 'scheduled',
        room_id TEXT UNIQUE,
        google_meet_link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (host_id) REFERENCES users (id),
        FOREIGN KEY (guest_id) REFERENCES users (id)
      )
    `);

    // User progress table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_interviews INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        average_score REAL DEFAULT 0,
        streak_days INTEGER DEFAULT 0,
        last_activity DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('Database initialized successfully');
  });
};