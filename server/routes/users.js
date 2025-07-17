import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user progress
    db.get('SELECT * FROM user_progress WHERE user_id = ?', [userId], (err, progress) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching progress' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        preferredPosition: user.preferred_position,
        experienceLevel: user.experience_level,
        progress: progress || {}
      });
    });
  });
});

// Get daily challenge
router.get('/daily-challenge', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];
  
  // Check if user already has today's challenge
  db.get(
    'SELECT * FROM daily_challenges WHERE user_id = ? AND challenge_date = ?',
    [userId, today],
    (err, challenge) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
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
      
      db.run(
        'INSERT INTO daily_challenges (user_id, challenge_date, question) VALUES (?, ?, ?)',
        [userId, today, randomChallenge],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating challenge' });
          }
          
          res.json({
            id: this.lastID,
            challenge_date: today,
            question: randomChallenge,
            completed: false
          });
        }
      );
    }
  );
});

// Submit daily challenge
router.post('/daily-challenge', authenticateToken, (req, res) => {
  const { challengeId, answer } = req.body;
  const userId = req.user.id;
  
  db.run(
    'UPDATE daily_challenges SET answer = ?, score = 80, completed = 1 WHERE id = ? AND user_id = ?',
    [answer, challengeId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error submitting challenge' });
      }
      
      res.json({ message: 'Challenge completed!', score: 80 });
    }
  );
});

export default router;