const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/admin.auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public Admin Routes (No token needed yet)
router.post('/auth/login',authLimiter, adminAuthController.login);
router.post('/auth/login/2fa',authLimiter, adminAuthController.loginWith2FA);

// Protected Admin Routes (Requires standard token)
router.post('/auth/2fa/setup', verifyToken, adminAuthController.setup2FA);
router.post('/auth/2fa/verify', verifyToken, adminAuthController.verify2FASetup);

module.exports = router;