import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/init.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, preferredPosition, experienceLevel } = req.body;

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userResult.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const insertUserResult = await pool.query(
      'INSERT INTO users (username, email, password, preferred_position, experience_level) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [username, email, hashedPassword, preferredPosition, experienceLevel]
    );
    const userId = insertUserResult.rows[0].id;

    // Initialize user progress
    await pool.query('INSERT INTO user_progress (user_id) VALUES ($1)', [userId]);

    const token = jwt.sign(
      { id: userId, username, email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: userId,
        username,
        email,
        preferredPosition,
        experienceLevel
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        preferredPosition: user.preferred_position,
        experienceLevel: user.experience_level
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;