const mongoose = require('mongoose');

const studentAttemptSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learning_unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningUnit', required: true },
  
  // Abuse Prevention (Tracks how many times they opened this node)
  view_count: { type: Number, default: 1 },
  
  // Timestamps for timed quizzes
  started_at: { type: Date, default: Date.now },
  submitted_at: { type: Date, default: null },
  
  status: { 
    type: String, 
    enum: ['IN_PROGRESS', 'SUBMITTED', 'GRADED'], 
    default: 'IN_PROGRESS' 
  },
  total_score_obtained: { type: Number, default: null },
  is_passed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('StudentAttempt', studentAttemptSchema);