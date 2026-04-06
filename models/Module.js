const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  order_index: { type: Number, required: true },
  
  // Relative Drip Content
  is_locked: { type: Boolean, default: false },
  unlock_days: { type: Number, default: 0 } // Days after enrollment this unlocks
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);