import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  position: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  questions: {
    type: [String],
    required: true
  },
  answers: {
    type: [String],
    default: []
  },
  score: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: null
  },
  duration: {
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

export default mongoose.model('InterviewSession', interviewSessionSchema); 