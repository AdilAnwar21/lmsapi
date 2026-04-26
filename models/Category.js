const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true
    },
    slug: { 
        type: String, 
        unique: true 
    },
    description: { 
        type: String,
        trim: true
    },
    is_active: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

// Auto-generate the slug from the name before saving to the DB
categorySchema.pre('save', function(next) {
    // Only run this if the name was modified (or is new)
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    // next();
});

module.exports = mongoose.model('Category', categorySchema);