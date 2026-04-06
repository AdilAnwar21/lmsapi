const mongoose = require('mongoose');

const courseDiscussionSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  content: { type: String, required: true, maxlength: 2000 },
  
  // The Threading Engine (Self-referencing)
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseDiscussion', default: null },
  
  // Social Features
  tagged_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  is_resolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('CourseDiscussion', courseDiscussionSchema);