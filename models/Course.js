const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  validity_days: { type: Number, required: true }, // e.g., 365
  
  // Settings
  structure_mode: { type: String, enum: ['linear', 'flexible'], default: 'linear' },
  is_published: { type: Boolean, default: false },
  
  // Post-Completion Logic
  post_completion_access: { type: String, enum: ['RETAIN', 'REVOKE'], default: 'RETAIN' },
  thank_you_message: { type: String }, // HTML text
  issues_certificate: { type: Boolean, default: false },
  is_certificate_enabled: {
      type: Boolean,
      default: true // Allows admin to turn off certificates for mini-courses
  },
  certificate_template_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CertificateTemplate',
      default: null // Admin will select this from a dropdown
  },
  
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);