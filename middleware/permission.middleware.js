const AppError = require('../utils/AppError');

exports.checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        // 1. Super Admin bypass (Admins can do everything)
        if (req.user.role === 'admin') {
            return next();
        }

        // 2. Staff check
        if (req.user.role === 'staff') {
            // Check if the staff's permissions array includes the required string
            if (req.user.permissions && req.user.permissions.includes(requiredPermission)) {
                return next();
            }
        }

        // 3. If they fail the checks, kick them out
        return next(new AppError(`Forbidden: You lack the '${requiredPermission}' permission.`, 403));
    };
};