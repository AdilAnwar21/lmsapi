const Module = require('../models/Module');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createModule = catchAsync(async (req, res, next) => {
    const { course_id, title, order_index, unlock_days } = req.body;
    if (!course_id || !title) {
        return next(new AppError('course_id and title are required.', 400));
    }
    const newModule = await Module.create({
        course_id, title, order_index, unlock_days
    });
    res.status(201).json({ success: true, data: newModule });
});

exports.updateModule = catchAsync(async (req, res, next) => {
    const updatedModule = await Module.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!updatedModule) {
        return next(new AppError('Module not found.', 404));
    }
    res.status(200).json({ success: true, data: updatedModule });
});

exports.deleteModule = catchAsync(async (req, res, next) => {
    const deletedModule = await Module.findByIdAndDelete(req.params.id);
    if (!deletedModule) {
        return next(new AppError('Module not found.', 404));
    }
    res.status(200).json({ success: true, message: 'Module deleted.' });
});
