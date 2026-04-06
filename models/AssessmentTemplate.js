const mongoose = require('mongoose');

const assessmentTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['QUIZ', 'SURVEY'], 
    default: 'QUIZ' 
  },
  
  duration_minutes: { type: Number, default: 0 }, // 0 means unlimited time
  passing_score: { type: Number, default: null } // e.g., 80. Null for surveys
}, { timestamps: true });

module.exports = mongoose.model('AssessmentTemplate', assessmentTemplateSchema);