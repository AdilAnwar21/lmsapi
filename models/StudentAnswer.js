const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema({
  attempt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentAttempt', required: true },
  field_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TemplateField', default: null }, // Null if it's just a general assignment upload
  
  // The Data
  answer_text: { type: String }, // Selected Option ID or Typed text
  attachment_url: { type: String }, // AWS S3/Cloudinary link for file uploads
  
  // Feedback
  marks_obtained: { type: Number, default: 0 },
  admin_feedback: { type: String } // e.g., "Great job on part 2, but check part 1."
}, { timestamps: true });

module.exports = mongoose.model('StudentAnswer', studentAnswerSchema);