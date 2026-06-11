const Course = require('../models/Course');
const Category = require('../models/Category');
const Module = require('../models/Module');
const LearningUnit = require('../models/LearningUnit');
const { decodeQuery } = require('../utils/encoder');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const slugify = require('slugify');

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

    const slug = slugify(title, { lower: true, strict: true });
    
    // Map structure mode from frontend (LINEAR/FREE_FLEXIBLE) to backend (linear/flexible)
    let mapped_mode = 'linear';
    if (structure_mode === 'FREE_FLEXIBLE' || structure_mode === 'flexible') mapped_mode = 'flexible';

    const newCourse = await Course.create({
        category_id,
        title,
        slug,
        pricing: {
            is_free: price === 0,
            regular_price: price
        },
        validity_days,
        structure_mode: mapped_mode,
        is_published: is_published || false,
        issues_certificate: issues_certificate || false
    });

    res.status(201).json({
        success: true,
        message: 'Course shell created successfully.',
        data: newCourse
    });
});

// Update Course Shell
exports.updateCourse = catchAsync(async (req, res, next) => {
    const { 
        category_id, 
        title, 
        price, 
        validity_days, 
        structure_mode,
        is_published,
        issues_certificate 
    } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    if (title) {
        course.title = title;
        course.slug = slugify(title, { lower: true, strict: true });
    }
    if (category_id) course.category_id = category_id;
    if (price !== undefined) {
        course.pricing.regular_price = price;
        course.pricing.is_free = price === 0;
    }
    if (validity_days !== undefined) course.validity_days = validity_days;
    
    if (structure_mode) {
        course.structure_mode = (structure_mode === 'FREE_FLEXIBLE' || structure_mode === 'flexible') ? 'flexible' : 'linear';
    }
    if (is_published !== undefined) course.is_published = is_published;
    if (issues_certificate !== undefined) course.issues_certificate = issues_certificate;

    await course.save();

    res.status(200).json({
        success: true,
        message: 'Course shell updated successfully.',
        data: course
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

// 3. Toggle Course Publish Status
exports.toggleCourseStatus = catchAsync(async (req, res, next) => {
    const { is_published } = req.body;
    if (typeof is_published !== 'boolean') {
        return next(new AppError('is_published must be a boolean.', 400));
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        { is_published },
        { new: true, runValidators: true }
    );

    if (!updatedCourse) {
        return next(new AppError('Course not found.', 404));
    }

    res.status(200).json({ success: true, data: updatedCourse });
});

// 4. Get Course Tree (Course -> Modules -> Units)
exports.getCourseTree = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
    
    // Fetch the course
    const course = await Course.findById(courseId).lean();
    if (!course) {
        return next(new AppError('Course not found.', 404));
    }

    // Fetch all modules
    const modules = await Module.find({ course_id: courseId }).sort({ order_index: 1 }).lean();

    // Fetch all units
    const moduleIds = modules.map(m => m._id);
    const units = await LearningUnit.find({ module_id: { $in: moduleIds } }).sort({ order_index: 1 }).lean();

    // Assemble the tree
    const unitsByModuleId = units.reduce((acc, unit) => {
        const modId = unit.module_id.toString();
        if (!acc[modId]) acc[modId] = [];
        acc[modId].push(unit);
        return acc;
    }, {});

    const modulesWithUnits = modules.map(m => ({
        ...m,
        units: unitsByModuleId[m._id.toString()] || []
    }));

    course.modules = modulesWithUnits;

    res.status(200).json({ success: true, data: course });
});