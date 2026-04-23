const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const AppError = require('../utils/AppError');

exports.verifyToken = async (req, res, next) => { // <-- Note the 'async'
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('Access denied. No token provided.', 401));
        }

        const token = authHeader.split(' ')[1];

        if (!token || token === 'null' || token === 'undefined') {
            return next(new AppError('Invalid token format.', 401));
        }

        // 🔥 NEW: Check if the token is in the Redis Blacklist
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return next(new AppError('Session expired. Please log in again.', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.isTemp) {
            return next(new AppError('Access denied. Please complete your 2FA verification first.', 403));
        }
        
        // Attach the user data AND the raw token to the request
        req.user = decoded;
        req.token = token; // We save this so the logout API can grab it easily!'

        
        
        next();
    } catch (error) {
        return next(error);
    }
};

// Optional: Role-checker middleware
exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
        }
        next();
    };
};