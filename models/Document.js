const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  original_name: {
    type: String,
    required: true
  },
  r2_key: {
    type: String,
    required: true,
    unique: true
  },
  mime_type: {
    type: String,
    required: true
  },
  size_bytes: {
    type: Number,
    required: true
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
