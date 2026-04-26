const mongoose = require('mongoose');

const onboardingFieldSchema = new mongoose.Schema({
    label: { 
        type: String, 
        required: [true, 'Please provide a label for this field (e.g., "College Name")'] 
    },
    input_type: { 
        type: String, 
        enum: ['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'DROPDOWN', 'FILE'], 
        required: true 
    },
    // Only used if input_type is 'DROPDOWN'
    options: [{ 
        type: String 
    }],
    is_required: { 
        type: Boolean, 
        default: true 
    },
    order_index: { 
        type: Number, 
        required: true // Determines the sequence the fields appear on the screen
    },
    is_active: { 
        type: Boolean, 
        default: true // Allows admins to retire old questions without deleting past data
    }
}, { timestamps: true });

module.exports = mongoose.model('OnboardingField', onboardingFieldSchema);