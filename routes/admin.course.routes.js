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

// Update Course (Requires course:edit)
router.patch('/:id', checkPermission('course:edit'), courseController.updateCourse);

// Toggle Course Status (Requires course:edit)
router.patch('/:id/status', checkPermission('course:edit'), courseController.toggleCourseStatus);

// Get Course Tree (Requires course:view)
router.get('/:id/tree', checkPermission('course:view'), courseController.getCourseTree);

module.exports = router;