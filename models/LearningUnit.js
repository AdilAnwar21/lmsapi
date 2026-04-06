const mongoose = require('mongoose');

const learningUnitSchema = new mongoose.Schema({
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  
  // The 4-Tier Type
  type: { 
    type: String, 
    enum: ['VIDEO', 'ASSESSMENT', 'ASSIGNMENT', 'NOTES'], 
    required: true 
  },
  
  // 1. VIDEO Data
  vdo_cipher_id: { type: String },
  video_duration: { type: Number }, // in seconds
  
  // 2. ASSESSMENT Data
  assessment_template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentTemplate' },
  
  // 3. ASSIGNMENT Data
  assignment_instructions: { type: String },
  assignment_file_type: { type: String }, // e.g., '.pdf,.zip'
  assignment_max_size_mb: { type: Number, default: 5 },
  
  // 4. NOTES Data
  notes_html: { type: String },
  notes_pdf_url: { type: String },
  
  // Logic, Gating & Constraints
  order_index: { type: Number, required: true },
  is_required: { type: Boolean, default: true },
  prerequisite_unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningUnit', default: null },
  max_views: { type: Number, default: null } // Null means unlimited
}, { timestamps: true });

module.exports = mongoose.model('LearningUnit', learningUnitSchema);