const User = require('../models/User');
const { decodeQuery } = require('../utils/encoder');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// 1. Create Team Member (Admin/Staff)
exports.createTeamMember = catchAsync(async (req, res, next) => {
    console.log(req.user);
    console.log(req.body);
    const { name, email, password, phone, role, permissions } = req.body;

    const currentUserRole = req.user.role; // From the JWT (verifyToken middleware)

    // THE GUARDRAIL: Prevent Staff from creating Admins
    if (role === 'admin' && currentUserRole !== 'admin') {
        return next(new AppError('SECURITY ALERT: Only existing Admins can create new Admin accounts.', 403));
    }

    // Ensure they are only creating valid team roles
    if (!['admin', 'staff'].includes(role)) {
        return next(new AppError('Invalid role. Must be admin or staff.', 400));
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email is already in use.', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeamMember = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: phone || "0000000000",
        role,
        // If they are an admin, they don't need explicit permissions. If staff, assign what was passed.
        permissions: role === 'admin' ? [] : (permissions || []),
        is_two_factor_enabled: false // They will set this up on their first login!
    });

    // Remove password from response
    newTeamMember.password = undefined;

    res.status(201).json({
        success: true,
        message: `${role === 'admin' ? 'Admin' : 'Staff'} account created successfully.`,
        data: newTeamMember
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