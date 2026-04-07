const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    
    // 1. CATCH EXPRESS BODY-PARSER ERRORS (The exact error you just got)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid JSON payload sent. Please check your request body." 
        });
    }

    let error = { ...err };
    error.message = err.message;

    // 2. CATCH MONGOOSE BAD OBJECT ID (e.g., /api/users/1234 instead of a real Mongo ID)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        error = new AppError(message, 404);
    }

    // 3. CATCH MONGOOSE DUPLICATE KEY (e.g., trying to register an email that already exists)
    if (err.code === 11000) {
        const message = `Duplicate field value entered. Please use another value.`;
        error = new AppError(message, 400);
    }

    // 4. CATCH MONGOOSE VALIDATION ERRORS
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400);
    }

    // 5. JWT ERRORS
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token. Please log in again.', 401);
    }
    if (err.name === 'TokenExpiredError') {
        error = new AppError('Your token has expired. Please log in again.', 401);
    }

    // THE FINAL JSON RESPONSE
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        // Only show the stack trace if we are in development mode!
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) 
    });
};

module.exports = errorHandler;