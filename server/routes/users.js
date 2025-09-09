import express from 'express';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import DailyChallenge from '../models/DailyChallenge.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const progress = await UserProgress.findOne({ user_id: userId }) || {};
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      preferredPosition: user.preferred_position,
      experienceLevel: user.experience_level,
      progress
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get daily challenge
router.get('/daily-challenge', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    const challenge = await DailyChallenge.findOne({ 
      user_id: userId, 
      challenge_date: { 
        $gte: today, 
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
      } 
    });
    
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
    
    const newChallenge = new DailyChallenge({
      user_id: userId,
      challenge_date: today,
      question: randomChallenge
    });
    await newChallenge.save();
    
    res.json({
      id: newChallenge._id,
      challenge_date: today,
      question: randomChallenge,
      completed: false
    });
  } catch (err) {
    console.error('Daily challenge error:', err);
    res.status(500).json({ error: 'Error creating challenge' });
  }
});

// Submit daily challenge
router.post('/daily-challenge', authenticateToken, async (req, res) => {
  const { challengeId, answer } = req.body;
  const userId = req.user.id;
  try {
    await DailyChallenge.findOneAndUpdate(
      { _id: challengeId, user_id: userId },
      { answer, score: 80, completed: true }
    );
    res.json({ message: 'Challenge completed!', score: 80 });
  } catch (err) {
    console.error('Submit challenge error:', err);
    res.status(500).json({ error: 'Error submitting challenge' });
  }
});

export default router;