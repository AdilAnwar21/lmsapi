const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
  // Access Control
  expiry_date: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'EXPIRED'], default: 'ACTIVE' },
  completed_at: { type: Date, default: null },
  
  // Progress Tracking
  completed_unit_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningUnit' }],
  completed_modules_log: [{
    module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    completed_at: { type: Date, default: Date.now }
  }],
  last_accessed_unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningUnit', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);