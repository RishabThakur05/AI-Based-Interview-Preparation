import dotenv from 'dotenv';
dotenv.config(); // ✅ Needed to load .env here too

import pkg from 'pg';
const { Pool } = pkg;

// Use DATABASE_URL from environment variables
console.log('DATABASE_URL:', process.env.DATABASE_URL); // Should not be undefined

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export { pool };

export const initializeDatabase = async () => {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'candidate',
      preferred_position TEXT,
      experience_level TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Interview sessions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS interview_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      position TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      questions TEXT NOT NULL,
      answers TEXT,
      score INTEGER,
      feedback TEXT,
      duration INTEGER,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Daily challenges table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_challenges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      challenge_date DATE NOT NULL,
      question TEXT NOT NULL,
      answer TEXT,
      score INTEGER,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Scheduled interviews table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scheduled_interviews (
      id SERIAL PRIMARY KEY,
      host_id INTEGER REFERENCES users(id),
      guest_id INTEGER REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      scheduled_time TIMESTAMP NOT NULL,
      duration INTEGER DEFAULT 60,
      status TEXT DEFAULT 'scheduled',
      room_id TEXT UNIQUE,
      google_meet_link TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User progress table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      total_interviews INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      average_score REAL DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      last_activity DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ PostgreSQL database initialized successfully');
};
