const mongoose = require('mongoose');

const userKycDataSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    field_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'OnboardingField', 
        required: true 
    },
    // This holds the text answer, the selected dropdown option, or the AWS/Cloudinary File URL
    value: { 
        type: String, 
        required: true 
    },
    // Admin verification workflow
    verification_status: { 
        type: String, 
        enum: ['PENDING', 'APPROVED', 'REJECTED'], 
        default: 'PENDING' 
    },
    admin_feedback: { 
        type: String, 
        default: null // e.g., "The ID card image is too blurry. Please re-upload."
    }
}, { timestamps: true });

// Prevent a student from submitting multiple answers for the exact same field
userKycDataSchema.index({ user_id: 1, field_id: 1 }, { unique: true });

module.exports = mongoose.model('UserKycData', userKycDataSchema);