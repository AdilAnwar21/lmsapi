const User = require('../models/User');
const { decodeQuery } = require('../utils/encoder');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/sendEmail');


// 1. Create Team Member (Admin/Staff)
exports.createTeamMember = catchAsync(async (req, res, next) => {
    // Notice: We removed 'password' from req.body
    const { name, email, phone, role, permissions } = req.body;
    const currentUserRole = req.user.role; 

    if (role === 'admin' && currentUserRole !== 'admin') {
        return next(new AppError('SECURITY ALERT: Only Admins can create new Admins.', 403));
    }

    if (!['admin', 'staff'].includes(role)) {
        return next(new AppError('Invalid role. Must be admin or staff.', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('An account with that email already exists.', 400));
    }

    const newTeamMember = await User.create({
        name,
        email,
        phone: phone || "0000000000",
        role,
        permissions: role === 'admin' ? [] : (permissions || []),
        is_two_factor_enabled: false,
        is_onboarded: false // They must complete the OTP flow
    });

    // Send the Welcome Email
    const loginUrl = 'http://localhost:4200/staff/setup'; // Your Angular frontend URL
    await sendEmail({
        email: newTeamMember.email,
        subject: 'Welcome to After Commerce!',
        html: `
            <h2>Welcome to the team, ${newTeamMember.name}!</h2>
            <p>An administrator has created an account for you.</p>
            <p>Please click the link below to verify your email and set up your secure password.</p>
            <a href="${loginUrl}">Complete Account Setup</a>
        `
    });

    res.status(201).json({
        success: true,
        message: `${role === 'admin' ? 'Admin' : 'Staff'} account created. Invite email sent!`,
        data: { id: newTeamMember._id, name: newTeamMember.name, email: newTeamMember.email }
    });
});

// 2. Get All Users (Paginated & Filtered)
exports.getAllUsers = catchAsync(async (req, res, next) => {
    // Extract query parameters with defaults
    let queryParams = {};

    // Check if the encoded 'q' parameter exists
    if (req.query.q) {
        queryParams = decodeQuery(req.query.q);
        
        if (!queryParams) {
            return next(new AppError('Invalid query format.', 400));
        }
    } else {
        // Fallback for normal testing/development
        queryParams = req.query; 
    }

    // Extract parameters from the decoded object
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const search = queryParams.search || '';
    const role = queryParams.role || '';
    const status = queryParams.status || '';

    // Build the MongoDB Query Object dynamically
    let query = {};

    // 1. Search Filter (Checks Name, Email, or Phone using Regex)
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    // 2. Role Filter (e.g., ?role=student or ?role=staff)
    if (role) {
        query.role = role;
    }

    // 3. Status Filter (Active vs Blocked)
    if (status === 'blocked') query.is_blocked = true;
    if (status === 'active') query.is_blocked = false;

    // Calculate Pagination
    const skip = (page - 1) * limit;

    // Execute Query in parallel for performance (fetching data + counting total docs)
    const [users, totalDocs] = await Promise.all([
        User.find(query)
            .select('-password -two_factor_secret') // Never send passwords or 2FA secrets!
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(limit),
        User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    res.status(200).json({
        success: true,
        data: users,
        pagination: {
            totalDocs,
            limit,
            page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
});

// const encodedString = btoa(JSON.stringify(filterParams));


const ALL_PERMISSIONS = [
    "course:view",
    "course:create",
    "course:edit",
    "course:delete",
    "content:manage",
    "user:view",
    "user:edit",
    "user:block",
    "team:view",
    "team:create",
    "team:edit",
    "finance:view",
    "finance:payout",
    "finance:refund",
    "marketing:view",
    "marketing:edit",
    "coupon:manage",
    "community:view",
    "community:moderate",
    "settings:manage"
  ];

exports.getAllPermissions = catchAsync(async (req,res,next)=>{
    res.status(200).json({
        success: true,
        data: ALL_PERMISSIONS
    });
})