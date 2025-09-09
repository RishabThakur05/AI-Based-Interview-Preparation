import express from 'express';
import InterviewSession from '../models/InterviewSession.js';
import ScheduledInterview from '../models/ScheduledInterview.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
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
    const session = new InterviewSession({
      user_id: userId,
      position,
      difficulty,
      questions
    });
    await session.save();
    
    res.json({
      sessionId: session._id,
      questions: questions.map((q, index) => ({ id: index + 1, question: q, answer: null }))
    });
  } catch (error) {
    console.error('Generate interview error:', error);
    res.status(500).json({ error: 'Error generating questions' });
  }
});

// Submit answer
router.post('/answer', authenticateToken, async (req, res) => {
  try {
    const { sessionId, questionId, answer } = req.body;
    const userId = req.user.id;
    
    // Get session
    const session = await InterviewSession.findOne({ _id: sessionId, user_id: userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const question = session.questions[questionId - 1];
    // Evaluate answer using AI
    const feedback = await evaluateAnswer(question, answer);
    
    // Update session with answer
    let answers = session.answers || [];
    answers[questionId - 1] = { question, answer, feedback };
    session.answers = answers;
    await session.save();
    
    res.json({ feedback });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Error processing answer' });
  }
});

// Complete interview
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;
    
    // Get session
    const session = await InterviewSession.findOne({ _id: sessionId, user_id: userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const answers = session.answers || [];
    const totalQuestions = session.questions.length;
    const answeredQuestions = answers.filter(a => a).length;
    
    // Calculate score
    let totalScore = 0;
    answers.forEach(answer => {
      if (answer && answer.feedback) {
        totalScore += answer.feedback.score || 0;
      }
    });
    const averageScore = answeredQuestions > 0 ? totalScore / answeredQuestions : 0;
    
    // Update session
    session.completed = true;
    session.score = Math.round(averageScore);
    await session.save();
    
    // Update user progress
    await UserProgress.findOneAndUpdate(
      { user_id: userId },
      {
        $inc: { total_interviews: 1, total_score: Math.round(averageScore) },
        $set: { last_activity: new Date() }
      },
      { upsert: true, new: true }
    ).then(async (progress) => {
      // Calculate new average score
      const newAverageScore = progress.total_interviews > 0 ? progress.total_score / progress.total_interviews : 0;
      await UserProgress.findByIdAndUpdate(progress._id, { average_score: newAverageScore });
    });
    
    res.json({
      score: Math.round(averageScore),
      totalQuestions,
      answeredQuestions,
      feedback: answers.filter(a => a && a.feedback).map(a => a.feedback)
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ error: 'Error completing interview' });
  }
});

// Get interview history
router.get('/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const sessions = await InterviewSession.find({ user_id: userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Error fetching history' });
  }
});

// Schedule interview
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    console.log('Schedule request received:', req.body);
    console.log('User from token:', req.user);
    
    const { title, description, scheduledTime, duration, guestEmail } = req.body;
    
    // Validate required fields
    if (!title || !scheduledTime || !guestEmail) {
      return res.status(400).json({ error: 'Title, scheduled time, and guest email are required' });
    }
    
    const hostId = req.user.id || req.user._id || req.user.userId;
    const roomId = uuidv4();
    
    console.log('Host ID:', hostId);
    
    // Find guest user
    const guest = await User.findOne({ email: guestEmail });
    if (!guest) {
      console.log('Guest not found with email:', guestEmail);
      return res.status(404).json({ error: 'Guest user not found. Please check the email address.' });
    }
    
    console.log('Guest found:', guest.email);
    
    // Find host user
    const host = await User.findById(hostId);
    if (!host) {
      console.log('Host not found with ID:', hostId);
      return res.status(500).json({ error: 'Host user not found' });
    }
    
    console.log('Host found:', host.email);
    
    // Create scheduled interview
    const scheduledInterview = new ScheduledInterview({
      host_id: hostId,
      guest_id: guest._id,
      title,
      description,
      scheduled_time: scheduledTime,
      duration,
      status: 'scheduled',
      room_id: roomId
    });
    await scheduledInterview.save();
    
    // Generate Google Meet link (disabled for now - can be enabled later with proper credentials)
    let meetLink = `https://meet.google.com/new`; // Generic Google Meet link
    
    // TODO: Enable Google Calendar integration when credentials are set up
    // try {
    //   const startTime = new Date(scheduledTime);
    //   const endTime = new Date(startTime.getTime() + duration * 60000);
    //   meetLink = await createMeetEvent({
    //     summary: title,
    //     description,
    //     startTime: startTime.toISOString(),
    //     endTime: endTime.toISOString(),
    //     attendees: [host.email, guest.email]
    //   });
    // } catch (meetErr) {
    //   console.error('Error creating Google Meet event:', meetErr);
    //   meetLink = 'https://meet.google.com/new';
    // }
    
    // Update the scheduled interview with the meet link
    scheduledInterview.google_meet_link = meetLink;
    await scheduledInterview.save();
    
    console.log('Interview scheduled successfully:', scheduledInterview._id);
    
    // Send email to host and guest (optional - won't fail if email fails)
    try {
      const transporter = nodemailer.createTransporter({
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
        html: `
          <h2>Interview Scheduled</h2>
          <p>Hello!</p>
          <p>An interview has been scheduled with the following details:</p>
          <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Description:</strong> ${description || 'No description provided'}</li>
            <li><strong>Date & Time:</strong> ${new Date(scheduledTime).toLocaleString()}</li>
            <li><strong>Duration:</strong> ${duration || 60} minutes</li>
            <li><strong>Room ID:</strong> ${roomId}</li>
          </ul>
          <p><strong>Google Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>
          <p>Best of luck!</p>
          <p>- InterviewAI Team</p>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email (non-critical):', emailError.message);
      // Don't fail the request if email fails
    }
    
    res.json({ 
      message: 'Interview scheduled successfully', 
      meetLink,
      roomId,
      interviewId: scheduledInterview._id
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ error: 'Error scheduling interview' });
  }
});

// Get scheduled interviews for the logged-in user
router.get('/scheduled', authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user._id || req.user.userId;
  console.log('Fetching scheduled interviews for user:', userId);
  
  try {
    const interviews = await ScheduledInterview.find({
      $or: [{ host_id: userId }, { guest_id: userId }]
    }).populate('host_id', 'username email')
      .populate('guest_id', 'username email')
      .sort({ scheduled_time: -1 });
    
    console.log('Found interviews:', interviews.length);
    res.json(interviews);
  } catch (err) {
    console.error('Get scheduled interviews error:', err);
    res.status(500).json({ error: 'Error fetching scheduled interviews' });
  }
});

// Get scheduled interview by room_id
router.get('/room/:roomId', authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  try {
    const interview = await ScheduledInterview.findOne({ room_id: roomId });
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json(interview);
  } catch (err) {
    console.error('Get room interview error:', err);
    res.status(500).json({ error: 'Error fetching interview' });
  }
});

// Cancel (delete) a scheduled interview with detailed logging
router.delete('/scheduled/:roomId', authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const interview = await ScheduledInterview.findOne({ room_id: roomId });
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    if (interview.host_id.toString() !== userId && interview.guest_id.toString() !== userId) {
      return res.status(404).json({ error: 'Not authorized' });
    }
    await ScheduledInterview.findOneAndDelete({ room_id: roomId });
    res.json({ message: 'Interview cancelled successfully' });
  } catch (err) {
    console.error('Cancel interview error:', err);
    res.status(500).json({ error: 'Error cancelling interview' });
  }
});

// Mark interview as joined by host or guest
router.post('/scheduled/:roomId/joined', authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const interview = await ScheduledInterview.findOne({ room_id: roomId });
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    let updateField = null;
    if (interview.host_id.toString() === userId) {
      updateField = { joined_host: true };
    } else if (interview.guest_id.toString() === userId) {
      updateField = { joined_guest: true };
    } else {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await ScheduledInterview.findOneAndUpdate({ room_id: roomId }, updateField);
    res.json({ message: 'Interview marked as joined' });
  } catch (err) {
    console.error('Mark joined error:', err);
    res.status(500).json({ error: 'Error updating joined status' });
  }
});


// Test route to verify authentication
router.get('/test-auth', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const user = await User.findById(userId);
    
    res.json({
      message: 'Authentication working',
      user: req.user,
      userId: userId,
      userFromDb: user ? { id: user._id, username: user.username, email: user.email } : null
    });
  } catch (error) {
    res.status(500).json({
      message: 'Authentication working but DB error',
      user: req.user,
      error: error.message
    });
  }
});

export default router;