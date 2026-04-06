const mongoose = require('mongoose');

const templateFieldSchema = new mongoose.Schema({
  template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentTemplate', required: true },
  
  input_type: { 
    type: String, 
    enum: ['MCQ', 'TEXT_SHORT', 'CHECKBOX'], 
    required: true 
  },
  label: { type: String, required: true }, // The question text
  points: { type: Number, default: 0 },
  
  // JSON object to hold multiple choice options, e.g., [{ id: 'A', text: 'Option 1' }]
  options_config: { type: mongoose.Schema.Types.Mixed, default: {} }, 
  
  order_index: { type: Number, required: true },
  is_required: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('TemplateField', templateFieldSchema);