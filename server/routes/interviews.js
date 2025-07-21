import express from 'express';
import { pool } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateInterviewQuestions, evaluateAnswer } from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { createMeetEvent } from '../services/googleCalendar.js';

const router = express.Router();

// Generate interview questions
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { position, difficulty, questionCount = 5 } = req.body;
    const userId = req.user.id;
    const questions = await generateInterviewQuestions(position, difficulty, questionCount);
    // Save interview session
    const result = await pool.query(
      'INSERT INTO interview_sessions (user_id, position, difficulty, questions) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, position, difficulty, JSON.stringify(questions)]
    );
    const sessionId = result.rows[0].id;
    res.json({
      sessionId,
      questions: questions.map((q, index) => ({ id: index + 1, question: q, answer: null }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error generating questions' });
  }
});

// Submit answer
router.post('/answer', authenticateToken, async (req, res) => {
  try {
    const { sessionId, questionId, answer } = req.body;
    const userId = req.user.id;
    // Get session
    const sessionResult = await pool.query('SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    const session = sessionResult.rows[0];
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const questions = JSON.parse(session.questions);
    const question = questions[questionId - 1];
    // Evaluate answer using AI
    const feedback = await evaluateAnswer(question, answer);
    // Update session with answer
    let answers = session.answers ? JSON.parse(session.answers) : {};
    answers[questionId] = { question, answer, feedback };
    await pool.query('UPDATE interview_sessions SET answers = $1 WHERE id = $2', [JSON.stringify(answers), sessionId]);
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: 'Error processing answer' });
  }
});

// Complete interview
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;
    // Get session
    const sessionResult = await pool.query('SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    const session = sessionResult.rows[0];
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const answers = JSON.parse(session.answers || '{}');
    const totalQuestions = JSON.parse(session.questions).length;
    const answeredQuestions = Object.keys(answers).length;
    // Calculate score
    let totalScore = 0;
    Object.values(answers).forEach(answer => {
      totalScore += answer.feedback.score || 0;
    });
    const averageScore = totalScore / answeredQuestions;
    // Update session
    await pool.query('UPDATE interview_sessions SET completed = TRUE, score = $1 WHERE id = $2', [Math.round(averageScore), sessionId]);
    // Update user progress
    await pool.query(
      `UPDATE user_progress SET 
         total_interviews = total_interviews + 1,
         total_score = total_score + $1,
         average_score = (total_score + $1) / (total_interviews + 1),
         last_activity = CURRENT_DATE,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [Math.round(averageScore), userId]
    );
    res.json({
      score: Math.round(averageScore),
      totalQuestions,
      answeredQuestions,
      feedback: Object.values(answers).map(a => a.feedback)
    });
  } catch (error) {
    res.status(500).json({ error: 'Error completing interview' });
  }
});

// Get interview history
router.get('/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query('SELECT * FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching history' });
  }
});

// Schedule interview
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const { title, description, scheduledTime, duration, guestEmail } = req.body;
    const hostId = req.user.id;
    const roomId = uuidv4();
    // Find guest user
    const guestResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [guestEmail]);
    const guest = guestResult.rows[0];
    if (!guest) {
      return res.status(404).json({ error: 'Guest user not found' });
    }
    // Find host email
    const hostResult = await pool.query('SELECT email, username FROM users WHERE id = $1', [hostId]);
    const host = hostResult.rows[0];
    if (!host) {
      return res.status(500).json({ error: 'Host user not found' });
    }
    // Create scheduled interview
    const insertResult = await pool.query(
      'INSERT INTO scheduled_interviews (host_id, guest_id, title, description, scheduled_time, duration, status, room_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [hostId, guest.id, title, description, scheduledTime, duration, 'scheduled', roomId]
    );
    // Generate Google Meet link
    let meetLink = '';
    try {
      const startTime = new Date(scheduledTime);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      meetLink = await createMeetEvent({
        summary: title,
        description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        attendees: [host.email, guest.email]
      });
    } catch (meetErr) {
      console.error('Error creating Google Meet event:', meetErr);
      if (meetErr && meetErr.response && meetErr.response.data) {
        console.error('Google API error details:', meetErr.response.data);
      }
      meetLink = 'Could not generate Google Meet link.';
    }
    // Send email to host and guest
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: [host.email, guest.email],
      subject: `Interview Scheduled: ${title}`,
      text: `Hello!\n\nAn interview has been scheduled.\n\nTitle: ${title}\nDescription: ${description}\nDate & Time: ${scheduledTime}\nDuration: ${duration} minutes\n\nGoogle Meet Link: ${meetLink}\n\nRoom ID: ${roomId}\n\nBest of luck!\nInterviewAI`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
    res.json({ message: 'Interview scheduled', meetLink });
  } catch (error) {
    res.status(500).json({ error: 'Error scheduling interview' });
  }
});

// Get scheduled interviews for the logged-in user
router.get('/scheduled', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query('SELECT * FROM scheduled_interviews WHERE host_id = $1 OR guest_id = $2 ORDER BY scheduled_time DESC', [userId, userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching scheduled interviews' });
  }
});

// Get scheduled interview by room_id
router.get('/room/:roomId', authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  try {
    const result = await pool.query('SELECT * FROM scheduled_interviews WHERE room_id = $1', [roomId]);
    const interview = result.rows[0];
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching interview' });
  }
});

// Cancel (delete) a scheduled interview with detailed logging
router.delete('/scheduled/:roomId', authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const interviewResult = await pool.query('SELECT * FROM scheduled_interviews WHERE room_id = $1', [roomId]);
    const interview = interviewResult.rows[0];
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    if (interview.host_id !== userId && interview.guest_id !== userId) {
      return res.status(404).json({ error: 'Not authorized' });
    }
    await pool.query('DELETE FROM scheduled_interviews WHERE room_id = $1', [roomId]);
    res.json({ message: 'Interview cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error cancelling interview' });
  }
});

// Mark interview as joined by host or guest
router.post('/scheduled/:roomId/joined', authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const interviewResult = await pool.query('SELECT * FROM scheduled_interviews WHERE room_id = $1', [roomId]);
    const interview = interviewResult.rows[0];
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    let column = null;
    if (interview.host_id === userId) {
      column = 'joined_host';
    } else if (interview.guest_id === userId) {
      column = 'joined_guest';
    } else {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await pool.query(`UPDATE scheduled_interviews SET ${column} = TRUE WHERE room_id = $1`, [roomId]);
    res.json({ message: 'Interview marked as joined' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating joined status' });
  }
});


export default router;