const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/admin.dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, dashboardController.getDashboardStats);

module.exports = router;
