const OnboardingField = require('../models/OnboardingField');
const UserKycData = require('../models/UserKycData');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ==========================================
// FORM BUILDER (ADMIN)
// ==========================================

// 1. Create a New Custom Field
exports.createField = catchAsync(async (req, res, next) => {
    const { label, input_type, options, is_required, order_index } = req.body;

    // Safety check: If it's a dropdown, they MUST provide options
    if (input_type === 'DROPDOWN' && (!options || options.length === 0)) {
        return next(new AppError('Dropdown fields require at least one option.', 400));
    }

    const field = await OnboardingField.create({
        label,
        input_type,
        options: input_type === 'DROPDOWN' ? options : [], // Strip options if not a dropdown
        is_required,
        order_index
    });

    res.status(201).json({
        success: true,
        message: 'Custom onboarding field created successfully.',
        data: field
    });
});

// 2. Get All Fields (For the Admin Table)
exports.getAllFields = catchAsync(async (req, res, next) => {
    // Admins see everything, including inactive ones, sorted by the order they appear
    const fields = await OnboardingField.find().sort({ order_index: 1 });

    res.status(200).json({
        success: true,
        count: fields.length,
        data: fields
    });
});

exports.getKycFieldById = catchAsync(async (req,res,next) => {
    const field = await OnboardingField.findById(req.params.id);

    if (!field) {
        return next(new AppError('Field not found.', 404));
    }

    res.status(200).json({
        success: true,
        data: field
    });
})

// 3. Update a Field (Or toggle active/inactive)
exports.updateField = catchAsync(async (req, res, next) => {
    const field = await OnboardingField.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true }
    );

    if (!field) {
        return next(new AppError('Field not found.', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Field updated successfully.',
        data: field
    });
});

// ==========================================
// STUDENT REVIEW (ADMIN)
// ==========================================

// 4. Review a Student's KYC Submission
exports.reviewStudentKyc = catchAsync(async (req, res, next) => {
    const { status, admin_feedback } = req.body; // status = 'APPROVED' or 'REJECTED'
    
    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return next(new AppError('Invalid status. Must be APPROVED or REJECTED.', 400));
    }

    const kycRecord = await UserKycData.findByIdAndUpdate(
        req.params.kycId,
        { 
            verification_status: status,
            admin_feedback: status === 'REJECTED' ? admin_feedback : null 
        },
        { new: true }
    );

    if (!kycRecord) return next(new AppError('KYC record not found.', 404));

    res.status(200).json({
        success: true,
        message: `Student document marked as ${status}.`,
        data: kycRecord
    });
});


