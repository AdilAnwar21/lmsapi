const { encodeQuery } = require('../utils/encoder'); // The utility file we discussed
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.generateEncodedQuery = catchAsync(async (req, res, next) => {
    // req.body is the "dictionary" or JSON object sent from Postman
    const payload = req.body;

    // Ensure they actually sent a populated object
    if (!payload || Object.keys(payload).length === 0) {
        return next(new AppError('Please provide a valid JSON object in the request body.', 400));
    }

    // Encode it using the utility function
    const encodedString = encodeQuery(payload);

    res.status(200).json({
        success: true,
        message: "Payload successfully encoded to Base64.",
        original: payload,
        encodedQuery: encodedString,
        // A helpful bonus: dynamically generating the test URL for you!
        testUrl: `http://localhost:5000/api/admin/users?q=${encodedString}`
    });
});