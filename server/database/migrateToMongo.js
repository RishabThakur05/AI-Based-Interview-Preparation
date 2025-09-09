import pkg from 'pg';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import InterviewSession from '../models/InterviewSession.js';
import DailyChallenge from '../models/DailyChallenge.js';
import ScheduledInterview from '../models/ScheduledInterview.js';

dotenv.config();

const { Pool } = pkg;

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-app';

async function migrateUsers() {
  try {
    const result = await pgPool.query('SELECT * FROM users');
    console.log(`Found ${result.rows.length} users to migrate`);
    
    for (const user of result.rows) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const newUser = new User({
          username: user.username,
          email: user.email,
          password: user.password,
          role: user.role,
          preferred_position: user.preferred_position,
          experience_level: user.experience_level
        });
        await newUser.save();
        console.log(`Migrated user: ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Error migrating users:', error);
  }
}

async function migrateUserProgress() {
  try {
    const result = await pgPool.query('SELECT * FROM user_progress');
    console.log(`Found ${result.rows.length} user progress records to migrate`);
    
    for (const progress of result.rows) {
      const user = await User.findOne({ email: progress.user_id });
      if (user) {
        const existingProgress = await UserProgress.findOne({ user_id: user._id });
        if (!existingProgress) {
          const newProgress = new UserProgress({
            user_id: user._id,
            total_interviews: progress.total_interviews,
            total_score: progress.total_score,
            average_score: progress.average_score,
            streak_days: progress.streak_days,
            last_activity: progress.last_activity
          });
          await newProgress.save();
          console.log(`Migrated progress for user: ${user.email}`);
        }
      }
    }
  } catch (error) {
    console.error('Error migrating user progress:', error);
  }
}

async function migrateInterviewSessions() {
  try {
    const result = await pgPool.query('SELECT * FROM interview_sessions');
    console.log(`Found ${result.rows.length} interview sessions to migrate`);
    
    for (const session of result.rows) {
      const user = await User.findOne({ id: session.user_id });
      if (user) {
        const existingSession = await InterviewSession.findOne({ 
          user_id: user._id,
          created_at: session.created_at
        });
        if (!existingSession) {
          const newSession = new InterviewSession({
            user_id: user._id,
            position: session.position,
            difficulty: session.difficulty,
            questions: JSON.parse(session.questions),
            answers: session.answers ? JSON.parse(session.answers) : [],
            score: session.score,
            feedback: session.feedback,
            duration: session.duration,
            completed: session.completed
          });
          await newSession.save();
          console.log(`Migrated interview session for user: ${user.email}`);
        }
      }
    }
  } catch (error) {
    console.error('Error migrating interview sessions:', error);
  }
}

async function migrateDailyChallenges() {
  try {
    const result = await pgPool.query('SELECT * FROM daily_challenges');
    console.log(`Found ${result.rows.length} daily challenges to migrate`);
    
    for (const challenge of result.rows) {
      const user = await User.findOne({ id: challenge.user_id });
      if (user) {
        const existingChallenge = await DailyChallenge.findOne({
          user_id: user._id,
          challenge_date: challenge.challenge_date
        });
        if (!existingChallenge) {
          const newChallenge = new DailyChallenge({
            user_id: user._id,
            challenge_date: challenge.challenge_date,
            question: challenge.question,
            answer: challenge.answer,
            score: challenge.score,
            completed: challenge.completed
          });
          await newChallenge.save();
          console.log(`Migrated daily challenge for user: ${user.email}`);
        }
      }
    }
  } catch (error) {
    console.error('Error migrating daily challenges:', error);
  }
}

async function migrateScheduledInterviews() {
  try {
    const result = await pgPool.query('SELECT * FROM scheduled_interviews');
    console.log(`Found ${result.rows.length} scheduled interviews to migrate`);
    
    for (const interview of result.rows) {
      const host = await User.findOne({ id: interview.host_id });
      const guest = await User.findOne({ id: interview.guest_id });
      
      if (host && guest) {
        const existingInterview = await ScheduledInterview.findOne({ room_id: interview.room_id });
        if (!existingInterview) {
          const newInterview = new ScheduledInterview({
            host_id: host._id,
            guest_id: guest._id,
            title: interview.title,
            description: interview.description,
            scheduled_time: interview.scheduled_time,
            duration: interview.duration,
            status: interview.status,
            room_id: interview.room_id,
            google_meet_link: interview.google_meet_link,
            joined_host: interview.joined_host,
            joined_guest: interview.joined_guest
          });
          await newInterview.save();
          console.log(`Migrated scheduled interview: ${interview.title}`);
        }
      }
    }
  } catch (error) {
    console.error('Error migrating scheduled interviews:', error);
  }
}

async function runMigration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Run migrations
    console.log('Starting migration...');
    await migrateUsers();
    await migrateUserProgress();
    await migrateInterviewSessions();
    await migrateDailyChallenges();
    await migrateScheduledInterviews();
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    await pgPool.end();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration }; 