import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, preferredPosition, experienceLevel } = req.body;
    
    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      db.run(
        'INSERT INTO users (username, email, password, preferred_position, experience_level) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, preferredPosition, experienceLevel],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' });
          }
          
          // Initialize user progress
          db.run(
            'INSERT INTO user_progress (user_id) VALUES (?)',
            [this.lastID],
            (err) => {
              if (err) console.error('Error initializing user progress:', err);
            }
          );
          
          const token = jwt.sign(
            { id: this.lastID, username, email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
          );
          
          res.json({
            token,
            user: {
              id: this.lastID,
              username,
              email,
              preferredPosition,
              experienceLevel
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
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
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;