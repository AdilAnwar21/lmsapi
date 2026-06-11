const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  order_index: { type: Number, default: 0 },
  unlock_days: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);