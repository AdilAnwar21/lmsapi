const LearningUnit = require('../models/LearningUnit');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createLearningUnit = catchAsync(async (req, res, next) => {
    const { module_id, title, type, content_data, order_index, prerequisite_unit_id } = req.body;
    if (!module_id || !type) {
        return next(new AppError('module_id and type are required.', 400));
    }
    const newUnit = await LearningUnit.create({
        module_id, title, type, content_data, order_index, prerequisite_unit_id
    });
    res.status(201).json({ success: true, data: newUnit });
});

exports.updateLearningUnit = catchAsync(async (req, res, next) => {
    const updatedUnit = await LearningUnit.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!updatedUnit) {
        return next(new AppError('Learning Unit not found.', 404));
    }
    res.status(200).json({ success: true, data: updatedUnit });
});

exports.deleteLearningUnit = catchAsync(async (req, res, next) => {
    const deletedUnit = await LearningUnit.findByIdAndDelete(req.params.id);
    if (!deletedUnit) {
        return next(new AppError('Learning Unit not found.', 404));
    }
    res.status(200).json({ success: true, message: 'Learning Unit deleted.' });
});
