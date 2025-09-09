import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge_date: {
    type: Date,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one challenge per user per day
dailyChallengeSchema.index({ user_id: 1, challenge_date: 1 }, { unique: true });

export default mongoose.model('DailyChallenge', dailyChallengeSchema); 