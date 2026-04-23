const Course = require('../models/Course');
const Category = require('../models/Category');
const { decodeQuery } = require('../utils/encoder');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// 1. Create a New Course Shell
exports.createCourse = catchAsync(async (req, res, next) => {
    const { 
        category_id, 
        title, 
        price, 
        validity_days, 
        structure_mode,
        is_published,
        issues_certificate 
    } = req.body;

    // Validate required enterprise fields
    if (!category_id || !title || price === undefined || !validity_days) {
        return next(new AppError('Category, Title, Price, and Validity Days are required.', 400));
    }

    // Ensure the category actually exists and is active
    const category = await Category.findById(category_id);
    if (!category || !category.is_active) {
        return next(new AppError('Invalid or inactive category selected.', 400));
    }

    const newCourse = await Course.create({
        category_id,
        title,
        price,
        validity_days,
        structure_mode: structure_mode || 'linear',
        is_published: is_published || false,
        issues_certificate: issues_certificate || false
    });

    res.status(201).json({
        success: true,
        message: 'Course shell created successfully.',
        data: newCourse
    });
});

// 2. Get All Courses (Paginated & Filtered for Admin Table)
exports.getAllCoursesFilter = catchAsync(async (req, res, next) => {
    let queryParams = {};

    if (req.query.q) {
        queryParams = decodeQuery(req.query.q);
        if (!queryParams) return next(new AppError('Invalid query format.', 400));
    } else {
        queryParams = req.query;
    }

    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const search = queryParams.search || '';
    const status = queryParams.status || '';
    const category_id = queryParams.category_id || '';

    let query = {};

    // Filter by Title
    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    // Filter by Published Status
    if (status === 'published') query.is_published = true;
    if (status === 'draft') query.is_published = false;

    // Filter by Specific Category
    if (category_id) query.category_id = category_id;

    const skip = (page - 1) * limit;

    // Fetch courses AND populate the category name so the frontend table looks nice
    const [courses, totalDocs] = await Promise.all([
        Course.find(query)
            .populate('category_id', 'name slug') // Brings in the Category Name
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Course.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    res.status(200).json({
        success: true,
        data: courses,
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