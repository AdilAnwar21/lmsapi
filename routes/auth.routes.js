const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes (No token needed)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected test route (Requires token)
router.get('/me', verifyToken, (req, res) => {
    res.status(200).json({ success: true, message: 'You have access!', user: req.user });
});

module.exports = router;