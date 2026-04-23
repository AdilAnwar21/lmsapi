const express = require('express');
const router = express.Router();
const courseController = require('../controllers/admin.course.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.use(verifyToken);

// ==========================================
// 1. SPECIFIC FILTER ROUTES 
// ==========================================

// Paginated Table API (Requires course:view)
router.get('/filter', checkPermission('course:view'), courseController.getAllCoursesFilter);


// ==========================================
// 2. STANDARD CRUD ROUTES
// ==========================================

// Create Course (Requires course:create)
router.post('/', checkPermission('course:create'), courseController.createCourse);

module.exports = router;