const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');

// Import our custom error utilities
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync.js');

// 1. Phase 1 Login (Email & Password)
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide an email and password.', 400));
    }

    const user = await User.findOne({ email });
    if (!user || !['admin', 'staff'].includes(user.role)) {
        return next(new AppError('Invalid credentials or unauthorized access.', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError('Invalid credentials.', 401));
    }

    // If 2FA is enabled, DO NOT send the real token. Send a temp token.
    if (user.is_two_factor_enabled) {
        const tempToken = jwt.sign(
            { id: user._id, role: user.role, isTemp: true },
            process.env.JWT_SECRET,
            { expiresIn: '5m' } // Only valid for 5 minutes
        );

        return res.status(200).json({
            success: true,
            requires2FA: true,
            tempToken,
            message: 'Please provide your 2FA code.'
        });
    }

    // If 2FA is NOT enabled (like the first time the Seed Admin logs in)
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log(token,'token');
    res.status(200).json({
        success: true,
        requires2FA: false,
        token,
        user: { id: user._id, name: user.name, role: user.role, is_two_factor_enabled: false }
    });
});

// 2. Setup 2FA (Generates the QR Code)
exports.setup2FA = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    if (user.is_two_factor_enabled) {
        return next(new AppError('2FA is already enabled.', 400));
    }

    // Generate a unique secret for this user
    const secret = authenticator.generateSecret();
    
    // Save the secret temporarily to the DB (we don't enable 2FA until they verify it)
    user.two_factor_secret = secret;
    await user.save();

    // Create the URL that Google Authenticator understands
    const otpauthUrl = authenticator.keyuri(user.email, 'AfterCommerce Admin', secret);

    // Convert the URL into a Base64 Image (QR Code)
    const qrCodeImage = await qrcode.toDataURL(otpauthUrl);

    res.status(200).json({
        success: true,
        qrCodeImage,
        secret // Send this just in case they want to type it manually
    });
});

// 3. Verify & Enable 2FA (First time scan)
exports.verify2FASetup = catchAsync(async (req, res, next) => {
    const { code } = req.body; 

    if (!code) {
        return next(new AppError('Please provide the 6-digit 2FA code.', 400));
    }

    const user = await User.findById(req.user.id);

    const isValid = authenticator.verify({ token: code, secret: user.two_factor_secret });

    if (!isValid) {
        return next(new AppError('Invalid 2FA code. Please try again.', 400));
    }

    if(user.is_two_factor_enabled) {
        return next(new AppError('2FA is already enabled.', 400));
    }

    user.is_two_factor_enabled = true;
    await user.save();
    return res.status(200).json({ success: true, message: '2FA successfully enabled!' });
});

// 4. Phase 2 Login (Submitting the code to get the real JWT)
exports.loginWith2FA = catchAsync(async (req, res, next) => {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
        return next(new AppError('Please provide both the temporary token and 2FA code.', 400));
    }

    // Decode the temp token (if it fails/expires, our global error handler catches it automatically!)
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    
    if (!decoded.isTemp) {
        return next(new AppError('Invalid token type.', 400));
    }

    const user = await User.findById(decoded.id);
    
    // Check the 6-digit code
    const isValid = authenticator.verify({ token: code, secret: user.two_factor_secret });
    if (!isValid) {
        return next(new AppError('Invalid 2FA code.', 400));
    }

    // Success! Issue the real 7-day token
    const finalToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
        success: true,
        token: finalToken,
        user: { id: user._id, name: user.name, role: user.role }
    });
});