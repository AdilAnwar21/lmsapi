const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  pricing: {
    is_free: { 
        type: Boolean, 
        default: false 
    },
    regular_price: { 
        type: Number, 
        required: function() { return !this.pricing.is_free; }, // Required if not free
        min: 0 
    },
    discounted_price: { 
        type: Number,
        min: 0,
        validate: {
            // Backend validation: Discounted price MUST be less than regular price
            validator: function(val) {
                if (!val) return true; // It's okay if it's empty
                return val < this.pricing.regular_price;
            },
            message: 'Discounted price must be lower than the regular price.'
        }
    }
  },
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


courseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
      this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);

