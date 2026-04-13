const mongoose = require('mongoose');

const certificateTemplateSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true // e.g., "Classic Professional", "Modern Minimalist"
    },
    thumbnail_url: { 
        type: String, 
        required: true // A small preview image for the Admin panel
    },
    background_image_url: { 
        type: String, 
        required: true // The high-res blank certificate image (stored on Cloudflare R2)
    },
    // The exact X/Y coordinates of where the text should be printed on this specific image
    text_config: {
        student_name: { x: Number, y: Number, font_size: Number, color: String },
        course_name: { x: Number, y: Number, font_size: Number, color: String },
        date_issued: { x: Number, y: Number, font_size: Number, color: String },
        certificate_id: { x: Number, y: Number, font_size: Number, color: String }
    },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);