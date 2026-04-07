class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        
        // Distinguish between client errors (4xx) and server errors (5xx)
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // Flag to identify intentional, known errors vs unexpected programming bugs
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;