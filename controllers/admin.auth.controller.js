const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');

// Import our custom error utilities
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync.js');

const sendEmail = require('../utils/sendEmail');
const redisClient = require('../config/redis');


// 1. Phase 1 Login (Email & Password)
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // We only require email at first, because first-time users don't have a password yet!
    if (!email) {
        return next(new AppError('Please provide an email.', 400));
    }

    const user = await User.findOne({ email });
    if (!user || !['admin', 'staff'].includes(user.role)) {
        return next(new AppError('Invalid credentials or unauthorized access.', 401));
    }

    // ==========================================
    // 🔥 NEW: THE FIRST LOGIN INTERCEPTOR
    // ==========================================
    if (user.is_onboarded === false) {
        // 1. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 2. Save to Redis (10 min expiry)
        await redisClient.setEx(`otp:${email}`, 600, otp);

        // 3. Send Email
        await sendEmail({
            email: user.email,
            subject: 'Your Account Setup Code',
            html: `<h2>Welcome to the team!</h2>
                   <p>Your 6-digit setup code is: <strong>${otp}</strong></p>
                   <p>This code will expire in 10 minutes.</p>`
        });

        // 4. Tell the Frontend to switch the UI!
        return res.status(200).json({
            success: true,
            requiresSetup: true, 
            message: 'First login detected. Verification code sent to email.'
        });
    }

    // ==========================================
    // 🛡️ STANDARD LOGIN (For onboarded users)
    // ==========================================
    if (!password) {
        return next(new AppError('Please provide your password.', 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError('Invalid credentials.', 401));
    }

    // If 2FA is enabled...
    if (user.is_two_factor_enabled) {
        const tempToken = jwt.sign(
            { id: user._id, role: user.role, isTemp: true },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        return res.status(200).json({
            success: true,
            requires2FA: true,
            tempToken,
            message: 'Please provide your 2FA code.'
        });
    }

    // Standard 7-day token issuance
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(200).json({
        success: true,
        requires2FA: false,
        requiresSetup: false,
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


// Add this to admin.auth.controller.js
exports.completeSetup = catchAsync(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return next(new AppError('Please provide email, OTP, and a new password.', 400));
    }

    // 1. Retrieve OTP from Redis
    const cachedOtp = await redisClient.get(`otp:${email}`);

    if (!cachedOtp || cachedOtp !== otp) {
        return next(new AppError('Invalid or expired verification code.', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('User not found.', 404));
    }

    // 2. Hash the new password and lock in the onboarding
    user.password = await bcrypt.hash(newPassword, 10);
    user.is_onboarded = true;
    await user.save();

    // 3. Delete the OTP from Redis so it can't be used again
    await redisClient.del(`otp:${email}`);

    // 4. Generate a standard 7-day JWT so they can instantly proceed to the 2FA setup screen
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
        success: true,
        message: 'Account successfully set up! Proceeding to dashboard...',
        token,
        user: { id: user._id, name: user.name, role: user.role, is_two_factor_enabled: false }
    });
});