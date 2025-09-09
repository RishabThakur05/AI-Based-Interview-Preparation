import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  total_interviews: {
    type: Number,
    default: 0
  },
  total_score: {
    type: Number,
    default: 0
  },
  average_score: {
    type: Number,
    default: 0
  },
  streak_days: {
    type: Number,
    default: 0
  },
  last_activity: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('UserProgress', userProgressSchema); 