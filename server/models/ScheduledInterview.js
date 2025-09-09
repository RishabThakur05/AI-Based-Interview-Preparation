import mongoose from 'mongoose';

const scheduledInterviewSchema = new mongoose.Schema({
  host_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guest_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  scheduled_time: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    default: 'scheduled',
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled']
  },
  room_id: {
    type: String,
    unique: true,
    required: true
  },
  google_meet_link: {
    type: String,
    default: null
  },
  joined_host: {
    type: Boolean,
    default: false
  },
  joined_guest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('ScheduledInterview', scheduledInterviewSchema); 