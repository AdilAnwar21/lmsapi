const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures'); // Import the utility class

// 1. Create a new Influencer
exports.createInfluencer = catchAsync(async (req, res, next) => {
    const { name, email, referral_code, discount_percentage, commission_percentage,phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return next(new AppError('A user with this email already exists.', 400));

    const existingCode = await User.findOne({ 'influencer_profile.referral_code': referral_code.toUpperCase() });
    if (existingCode) return next(new AppError('This referral code is already in use.', 400));

    const defaultPassword = Math.random().toString(36).slice(-8);

    const influencer = await User.create({
        name,
        email,
        password: defaultPassword,
        role: 'influencer',
        phone:phone,
        influencer_profile: {
            referral_code: referral_code.toUpperCase(),
            discount_percentage,
            commission_percentage
        }
    });

    res.status(201).json({ success: true, message: 'Influencer created successfully.', data: influencer });
});

// 2. Get all Influencers (Standard List)
exports.getAllInfluencers = catchAsync(async (req, res, next) => {
    const influencers = await User.find({ role: 'influencer' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: influencers.length, data: influencers });
});

// 3. Get Influencers (Paginated & Filtered via Base64)
exports.getAllInfluencersFilter = catchAsync(async (req, res, next) => {
    const baseQuery = User.find({ role: 'influencer' });

    // Initialize features (handles Base64 decoding automatically)
    const features = new APIFeatures(baseQuery, req.query)
        .filter()
        .search(['name', 'email', 'influencer_profile.referral_code']) // Search across these fields
        .sort()
        .paginate();

    const influencers = await features.query;

    // Get total count for pagination UI
    const countFeatures = new APIFeatures(User.find({ role: 'influencer' }), req.query)
        .filter()
        .search(['name', 'email', 'influencer_profile.referral_code']);
        
    const totalRecords = await countFeatures.query.countDocuments();

    // The 'features.queryString' contains the decoded params
    const page = features.queryString.page * 1 || 1;
    const limit = features.queryString.limit * 1 || 10;

    res.status(200).json({
        success: true,
        pagination: {
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            limit: limit
        },
        data: influencers
    });
});

// 4. Get single Influencer by ID
exports.getInfluencerById = catchAsync(async (req, res, next) => {
    const influencer = await User.findOne({ _id: req.params.id, role: 'influencer' });
    if (!influencer) return next(new AppError('Influencer not found.', 404));

    res.status(200).json({ success: true, data: influencer });
});

// 5. Update Influencer Details
exports.updateInfluencer = catchAsync(async (req, res, next) => {
    const { name, is_active, referral_code, discount_percentage, commission_percentage,phone } = req.body;

    const updates = { name, is_active ,phone};
    
    if (referral_code || discount_percentage !== undefined || commission_percentage !== undefined) {
        if (referral_code) updates['influencer_profile.referral_code'] = referral_code.toUpperCase();
        if (discount_percentage !== undefined) updates['influencer_profile.discount_percentage'] = discount_percentage;
        if (commission_percentage !== undefined) updates['influencer_profile.commission_percentage'] = commission_percentage;
    }

    const influencer = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'influencer' },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!influencer) return next(new AppError('Influencer not found.', 404));

    res.status(200).json({ success: true, message: 'Influencer updated successfully.', data: influencer });
});