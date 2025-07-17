import express from 'express';
import { db } from '../database/init.js';
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
    db.run(
      'INSERT INTO interview_sessions (user_id, position, difficulty, questions) VALUES (?, ?, ?, ?)',
      [userId, position, difficulty, JSON.stringify(questions)],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error saving interview session' });
        }
        
        res.json({
          sessionId: this.lastID,
          questions: questions.map((q, index) => ({
            id: index + 1,
            question: q,
            answer: null
          }))
        });
      }
    );
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
    db.get('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?', [sessionId, userId], async (err, session) => {
      if (err || !session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const questions = JSON.parse(session.questions);
      const question = questions[questionId - 1];
      
      // Evaluate answer using AI
      const feedback = await evaluateAnswer(question, answer);
      
      // Update session with answer
      let answers = session.answers ? JSON.parse(session.answers) : {};
      answers[questionId] = {
        question,
        answer,
        feedback
      };
      
      db.run(
        'UPDATE interview_sessions SET answers = ? WHERE id = ?',
        [JSON.stringify(answers), sessionId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error saving answer' });
          }
          
          res.json({ feedback });
        }
      );
    });
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
    db.get('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?', [sessionId, userId], (err, session) => {
      if (err || !session) {
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
      db.run(
        'UPDATE interview_sessions SET completed = 1, score = ? WHERE id = ?',
        [Math.round(averageScore), sessionId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error completing interview' });
          }
          
          // Update user progress
          db.run(
            `UPDATE user_progress SET 
             total_interviews = total_interviews + 1,
             total_score = total_score + ?,
             average_score = (total_score + ?) / (total_interviews + 1),
             last_activity = DATE('now'),
             updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            [Math.round(averageScore), Math.round(averageScore), userId],
            (err) => {
              if (err) console.error('Error updating progress:', err);
            }
          );
          
          res.json({
            score: Math.round(averageScore),
            totalQuestions,
            answeredQuestions,
            feedback: Object.values(answers).map(a => a.feedback)
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Error completing interview' });
  }
});

// Get interview history
router.get('/history', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.all(
    'SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, sessions) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching history' });
      }
      
      res.json(sessions);
    }
  );
});

// Schedule interview
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const { title, description, scheduledTime, duration, guestEmail } = req.body;
    const hostId = req.user.id;
    const roomId = uuidv4();
    // Find guest user
    db.get('SELECT id, email FROM users WHERE email = ?', [guestEmail], (err, guest) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!guest) {
        return res.status(404).json({ error: 'Guest user not found' });
      }
      // Find host email
      db.get('SELECT email, username FROM users WHERE id = ?', [hostId], async (err, host) => {
        if (err || !host) {
          return res.status(500).json({ error: 'Host user not found' });
        }
        // Create scheduled interview
        db.run(
          'INSERT INTO scheduled_interviews (host_id, guest_id, title, description, scheduled_time, duration, status, room_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [hostId, guest.id, title, description, scheduledTime, duration, 'scheduled', roomId],
          async function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error scheduling interview' });
            }
            // Generate Google Meet link
            let meetLink = '';
            try {
              // Calculate end time based on duration
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
            res.json({
              id: this.lastID,
              roomId,
              meetLink,
              message: 'Interview scheduled successfully'
            });
          }
        );
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error scheduling interview' });
  }
});

// Get scheduled interviews for the logged-in user
router.get('/scheduled', authenticateToken, (req, res) => {
  const userId = req.user.id;
  console.log('Fetching scheduled interviews for user:', userId);
  db.all(
    'SELECT * FROM scheduled_interviews WHERE host_id = ? OR guest_id = ? ORDER BY scheduled_time DESC',
    [userId, userId],
    (err, interviews) => {
      if (err) {
        console.error('Error fetching scheduled interviews:', err);
        return res.status(500).json({ error: 'Error fetching scheduled interviews' });
      }
      console.log('Scheduled interviews found:', interviews);
      res.json(interviews);
    }
  );
});

// Get scheduled interview by room_id
router.get('/room/:roomId', authenticateToken, (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  console.log('Looking up interview for roomId:', roomId, 'userId:', userId);
  db.get('SELECT * FROM scheduled_interviews WHERE room_id = ?', [roomId], (err, interview) => {
    if (err) {
      console.error('Error fetching interview:', err);
      return res.status(500).json({ error: 'Error fetching interview' });
    }
    if (!interview) {
      console.log('No interview found for roomId:', roomId);
      return res.status(404).json({ error: 'Interview not found' });
    }
    console.log('Interview found:', interview);
    res.json(interview);
  });
});

// Cancel (delete) a scheduled interview with detailed logging
router.delete('/scheduled/:roomId', authenticateToken, (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  console.log('Delete request for roomId:', roomId, 'by userId:', userId);

  db.get(
    'SELECT * FROM scheduled_interviews WHERE room_id = ?',
    [roomId],
    (err, interview) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!interview) {
        console.log('No interview found for roomId:', roomId);
        return res.status(404).json({ error: 'Interview not found' });
      }
      if (interview.host_id !== userId && interview.guest_id !== userId) {
        console.log('User not authorized to delete this interview:', userId);
        return res.status(404).json({ error: 'Not authorized' });
      }
      db.run(
        'DELETE FROM scheduled_interviews WHERE room_id = ?',
        [roomId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Error cancelling interview' });
          }
          res.json({ message: 'Interview cancelled successfully' });
        }
      );
    }
  );
});

// Mark interview as joined by host or guest
router.post('/scheduled/:roomId/joined', authenticateToken, (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  db.get('SELECT * FROM scheduled_interviews WHERE room_id = ?', [roomId], (err, interview) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
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
    db.run(`UPDATE scheduled_interviews SET ${column} = 1 WHERE room_id = ?`, [roomId], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating joined status' });
      }
      res.json({ message: 'Interview marked as joined' });
    });
  });
});

export default router;