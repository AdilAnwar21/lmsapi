const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { decodeQuery } = require('../utils/encoder');

// 1. Create Category
exports.createCategory = catchAsync(async (req, res, next) => {
    console.log("Is NEXT a function here?", typeof next);
    const { name, description } = req.body;

    if (!name) {
        return next(new AppError('Category name is required.', 400));
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: category
    });
});

// 2. Get All Categories (For the Admin Table)
exports.getAllCategories = catchAsync(async (req, res, next) => {
    // We return everything here, including inactive ones, so the Admin can manage them
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});

// 3. Update Category
exports.updateCategory = catchAsync(async (req, res, next) => {
    const { name, description, is_active } = req.body;
    
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new AppError('Category not found.', 404));
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (is_active !== undefined) category.is_active = is_active;

    // We use .save() instead of findByIdAndUpdate so the 'pre-save' slugify hook triggers!
    await category.save();

    res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        data: category
    });
});

// 4. Soft Delete Category
exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new AppError('Category not found.', 404));
    }

    // Soft delete: Just hide it from the public UI
    category.is_active = false;
    await category.save();

    res.status(200).json({
        success: true,
        message: 'Category deactivated successfully. It will no longer appear to students.'
    });
});


exports.getAllCategoriesFilter = catchAsync(async (req, res, next) => {
    let queryParams = {};

    // 1. Handle Encoded Query (Consistency with User API)
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

    // 2. Build Dynamic MongoDB Query
    let query = {};

    // Filter by name or description
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter by Active/Inactive status
    if (status === 'active') query.is_active = true;
    if (status === 'inactive') query.is_active = false;

    const skip = (page - 1) * limit;

    // 3. Execute Query & Count in Parallel
    const [categories, totalDocs] = await Promise.all([
        Category.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Category.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    res.status(200).json({
        success: true,
        data: categories,
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