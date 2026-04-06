const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
  issued_at: { type: Date, default: Date.now },
  certificate_url: { type: String, required: true },
  credential_id: { type: String, required: true, unique: true } // e.g., 'CERT-2026-XYZ'
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);