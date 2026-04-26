const OnboardingField = require('../models/OnboardingField');
const UserKycData = require('../models/UserKycData');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// 1. Fetch the Form (For the Student)
exports.getOnboardingForm = catchAsync(async (req, res, next) => {
    // Students ONLY see active fields
    const fields = await OnboardingField.find({ is_active: true }).sort({ order_index: 1 });

    res.status(200).json({
        success: true,
        count: fields.length,
        data: fields
    });
});

// 2. Submit the Form
exports.submitOnboarding = catchAsync(async (req, res, next) => {
    const { answers } = req.body; 
    // Expecting: answers = [{ field_id: "...", value: "..." }, { field_id: "...", value: "..." }]

    if (!answers || !Array.isArray(answers)) {
        return next(new AppError('Invalid submission format.', 400));
    }

    // Prepare the payload for MongoDB
    const payload = answers.map(answer => ({
        user_id: req.user.id, // Pulled securely from the JWT token
        field_id: answer.field_id,
        value: answer.value,
        verification_status: 'PENDING'
    }));

    // Use insertMany to save all answers at once. 
    // The compound index we made prevents them from submitting twice!
    try {
        await UserKycData.insertMany(payload);
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError('You have already submitted answers for this form.', 400));
        }
        return next(error);
    }

    // Unlock the student's account!
    await User.findByIdAndUpdate(req.user.id, { is_onboarded: true });

    res.status(200).json({
        success: true,
        message: 'Onboarding completed successfully. Welcome to AfterCommerce!'
    });
});