const mongoose = require('mongoose');

const learningUnitSchema = new mongoose.Schema({
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  type: { 
    type: String, 
    enum: ['VIDEO', 'NOTES', 'ASSESSMENT', 'ASSIGNMENT'], 
    required: true 
  },
  content_data: { type: mongoose.Schema.Types.Mixed, default: {} },
  order_index: { type: Number, default: 0 },
  prerequisite_unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningUnit', default: null }
}, { timestamps: true });

module.exports = mongoose.model('LearningUnit', learningUnitSchema);