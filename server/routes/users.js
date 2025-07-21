import express from 'express';
import { pool } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const progressResult = await pool.query('SELECT * FROM user_progress WHERE user_id = $1', [userId]);
    const progress = progressResult.rows[0] || {};
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      preferredPosition: user.preferred_position,
      experienceLevel: user.experience_level,
      progress
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get daily challenge
router.get('/daily-challenge', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];
  try {
    const challengeResult = await pool.query('SELECT * FROM daily_challenges WHERE user_id = $1 AND challenge_date = $2', [userId, today]);
    const challenge = challengeResult.rows[0];
    if (challenge) {
      return res.json(challenge);
    }
    // Generate new daily challenge
    const challenges = [
      "What is the difference between var, let, and const in JavaScript?",
      "Explain the concept of closure in JavaScript with an example.",
      "How would you optimize a React component for performance?",
      "What are the key differences between SQL and NoSQL databases?",
      "Explain the time complexity of common sorting algorithms."
    ];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    const insertResult = await pool.query(
      'INSERT INTO daily_challenges (user_id, challenge_date, question) VALUES ($1, $2, $3) RETURNING id',
      [userId, today, randomChallenge]
    );
    res.json({
      id: insertResult.rows[0].id,
      challenge_date: today,
      question: randomChallenge,
      completed: false
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creating challenge' });
  }
});

// Submit daily challenge
router.post('/daily-challenge', authenticateToken, async (req, res) => {
  const { challengeId, answer } = req.body;
  const userId = req.user.id;
  try {
    await pool.query(
      'UPDATE daily_challenges SET answer = $1, score = 80, completed = TRUE WHERE id = $2 AND user_id = $3',
      [answer, challengeId, userId]
    );
    res.json({ message: 'Challenge completed!', score: 80 });
  } catch (err) {
    res.status(500).json({ error: 'Error submitting challenge' });
  }
});

export default router;