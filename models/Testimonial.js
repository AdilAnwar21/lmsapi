const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  
  content: { type: String, required: true, maxlength: 1000 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);