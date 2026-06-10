const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const OnboardingField = require('../models/OnboardingField');
const AssessmentTemplate = require('../models/AssessmentTemplate');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
    // 1. Fetch exactly the data needed by the frontend in a single parallel burst
    const [
        courses,
        totalCourses,
        publishedCourses,
        categories,
        totalCats,
        staff,
        kycCount,
        assessCount,
        influencers,
        admin
    ] = await Promise.all([
        Course.find().sort({ createdAt: -1 }).limit(10),
        Course.countDocuments(),
        Course.countDocuments({ is_published: true }),
        Category.find().sort({ createdAt: -1 }).limit(20),
        Category.countDocuments(),
        User.find({ role: { $in: ['admin', 'super_admin', 'editor', 'moderator'] } }).select('-password -__v').limit(50),
        OnboardingField.countDocuments(),
        AssessmentTemplate.countDocuments(),
        User.find({ role: 'influencer' }).select('-password -__v').limit(50),
        User.findById(req.user.id).select('-password -__v')
    ]);

    res.status(200).json({
        success: true,
        data: {
            admin,
            courses,
            totalCourses,
            publishedCourses,
            categories,
            totalCats,
            staff,
            kycCount,
            assessCount,
            influencers
        }
    });
});
