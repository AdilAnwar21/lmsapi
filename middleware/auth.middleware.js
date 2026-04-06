const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    try {
        // Look for the token in the headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the user data to the request so the next functions can use it
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
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