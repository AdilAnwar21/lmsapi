const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

// 1. Global API Limiter
// Protects against general DDoS attacks (e.g., 100 requests per 15 mins)
exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    handler: (req, res, next, options) => {
        next(new AppError('Too many requests from this IP, please try again in 15 minutes.', 429));
    }
});

// 2. Strict Auth Limiter 
// Protects against brute-force login attacks (e.g., 5 requests per 15 mins)
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window`
    handler: (req, res, next, options) => {
        next(new AppError('Too many login attempts from this IP, please try again after 15 minutes.', 429));
    }
});